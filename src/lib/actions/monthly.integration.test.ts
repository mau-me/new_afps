/**
 * Testes de integração das actions de mensalidade contra um MongoDB real em
 * memória (replica set, necessário para as transações).
 */
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type FakeSession = { user: { id: string; role: 'comissao' | 'jogador' } } | null;

const auth = vi.hoisted(() => ({ current: null as FakeSession }));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/session', () => {
  class AuthorizationError extends Error {}
  return {
    AuthorizationError,
    assertRole: vi.fn(async (role: string) => {
      if (!auth.current || auth.current.user.role !== role) {
        throw new AuthorizationError('Não autorizado');
      }
      return auth.current;
    }),
  };
});

let replSet: MongoMemoryReplSet;
let actions: typeof import('./monthly');
let Association: typeof import('@/lib/models/Association').default;
let Monthly: typeof import('@/lib/models/Monthly').default;
let Player: typeof import('@/lib/models/Player').default;
let Transaction: typeof import('@/lib/models/Transaction').default;

const adminId = new mongoose.Types.ObjectId().toString();
const MONTH = '2026-11';

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGODB_URI = replSet.getUri();

  // Importa depois de definir MONGODB_URI (lido ao carregar o módulo).
  actions = await import('./monthly');
  Association = (await import('@/lib/models/Association')).default;
  Monthly = (await import('@/lib/models/Monthly')).default;
  Player = (await import('@/lib/models/Player')).default;
  Transaction = (await import('@/lib/models/Transaction')).default;

  const dbConnect = (await import('@/lib/mongodb')).default;
  await dbConnect();
  // Garante índices (único por jogador/mês) e coleções antes das transações.
  await Promise.all([
    Association.init(),
    Monthly.init(),
    Player.init(),
    Transaction.init(),
  ]);
}, 180_000);

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

beforeEach(async () => {
  auth.current = { user: { id: adminId, role: 'comissao' } };
  await Promise.all([
    Association.deleteMany({}),
    Monthly.deleteMany({}),
    Player.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  await Association.create({
    name: 'Associação Teste',
    description: 'Teste',
    foundedDate: new Date('2020-01-01'),
    address: 'Rua Teste',
    phone: '71999990000',
    email: 'teste@example.com',
  });
});

let cpfSeq = 0;
async function createPlayer(nickname: string, isActive = true) {
  cpfSeq++;
  return Player.create({
    cpf: String(10000000000 + cpfSeq),
    fullName: `${nickname} da Silva`,
    nickname,
    position: 'Meia',
    shirtNumber: cpfSeq,
    birthDate: new Date('1990-01-01'),
    phone: '71999990000',
    address: 'Rua Teste, 1',
    isActive,
    createdBy: adminId,
  });
}

function settingsForm(fee: string, dueDay: string) {
  const form = new FormData();
  form.set('fee', fee);
  form.set('dueDay', dueDay);
  return form;
}

describe('updateMonthlySettings', () => {
  it('salva o valor em centavos e o dia de vencimento', async () => {
    const result = await actions.updateMonthlySettings({}, settingsForm('35,50', '5'));
    expect(result.ok).toBe(true);

    const association = await Association.findOne().lean();
    expect(association?.monthlyFeeCents).toBe(3550);
    expect(association?.dueDay).toBe(5);
  });

  it('devolve erros por campo quando inválido', async () => {
    const result = await actions.updateMonthlySettings({}, settingsForm('0', '30'));
    expect(result.ok).toBeUndefined();
    expect(result.errors?.fee).toBeDefined();
    expect(result.errors?.dueDay).toBeDefined();
  });
});

describe('generateMonthlies', () => {
  it('exige valor configurado', async () => {
    await createPlayer('Carlão');
    const result = await actions.generateMonthlies(MONTH);
    expect(result.ok).toBe(false);
    expect(await Monthly.countDocuments()).toBe(0);
  });

  it('gera só para ativos e não duplica ao gerar de novo', async () => {
    await Association.updateOne({}, { monthlyFeeCents: 3000, dueDay: 10 });
    await createPlayer('Carlão');
    await createPlayer('Paredão');
    await createPlayer('Aposentado', false);

    const first = await actions.generateMonthlies(MONTH);
    expect(first.ok).toBe(true);
    expect(await Monthly.countDocuments({ referenceMonth: MONTH })).toBe(2);

    await createPlayer('Novato');
    const second = await actions.generateMonthlies(MONTH);
    expect(second.message).toMatch(/^1 mensalidade/);
    expect(await Monthly.countDocuments({ referenceMonth: MONTH })).toBe(3);

    const third = await actions.generateMonthlies(MONTH);
    expect(third.message).toMatch(/já têm mensalidade/);
    expect(await Monthly.countDocuments({ referenceMonth: MONTH })).toBe(3);

    const monthly = await Monthly.findOne().lean();
    expect(monthly?.amountCents).toBe(3000);
    expect(monthly?.dueDate.toISOString()).toBe('2026-11-11T02:59:59.999Z');
  });
});

describe('registerPayment / undoPayment', () => {
  async function setupOpenMonthly() {
    await Association.updateOne({}, { monthlyFeeCents: 3000, dueDay: 10 });
    await createPlayer('Carlão');
    await actions.generateMonthlies(MONTH);
    const monthly = await Monthly.findOne().lean();
    return String(monthly!._id);
  }

  it('marca como paga e lança exatamente uma entrada no caixa', async () => {
    const id = await setupOpenMonthly();

    const result = await actions.registerPayment(id, '2026-11-05');
    expect(result.ok).toBe(true);

    const monthly = await Monthly.findById(id).lean();
    expect(monthly?.status).toBe('pago');
    expect(monthly?.paymentDate?.toISOString()).toBe('2026-11-05T15:00:00.000Z');

    const transactions = await Transaction.find({ monthlyId: id }).lean();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      type: 'entrada',
      category: 'Mensalidade',
      amountCents: 3000,
    });
    expect(transactions[0].description).toContain('Carlão');
  });

  it('não permite pagar duas vezes', async () => {
    const id = await setupOpenMonthly();
    await actions.registerPayment(id, '2026-11-05');

    const again = await actions.registerPayment(id, '2026-11-06');
    expect(again.ok).toBe(false);
    expect(await Transaction.countDocuments({ monthlyId: id })).toBe(1);
  });

  it('pagamentos simultâneos geram uma única entrada', async () => {
    const id = await setupOpenMonthly();
    const results = await Promise.all([
      actions.registerPayment(id, '2026-11-05'),
      actions.registerPayment(id, '2026-11-05'),
      actions.registerPayment(id, '2026-11-05'),
    ]);

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await Transaction.countDocuments({ monthlyId: id })).toBe(1);
  });

  it('rejeita data futura sem alterar nada', async () => {
    const id = await setupOpenMonthly();
    const result = await actions.registerPayment(id, '2999-01-01');
    expect(result.ok).toBe(false);
    expect((await Monthly.findById(id).lean())?.status).toBe('em_aberto');
    expect(await Transaction.countDocuments()).toBe(0);
  });

  it('desfazer volta para em aberto e remove a entrada do caixa', async () => {
    const id = await setupOpenMonthly();
    await actions.registerPayment(id, '2026-11-05');

    const undo = await actions.undoPayment(id);
    expect(undo.ok).toBe(true);

    const monthly = await Monthly.findById(id).lean();
    expect(monthly?.status).toBe('em_aberto');
    expect(monthly?.paymentDate).toBeUndefined();
    // Sai do caixa, mas continua no banco para auditoria.
    expect(
      await Transaction.countDocuments({ monthlyId: id, deletedAt: null })
    ).toBe(0);
    const removed = await Transaction.findOne({ monthlyId: id }).lean();
    expect(removed?.deletedAt).toBeInstanceOf(Date);
    expect(String(removed?.deletedBy)).toBe(adminId);

    const undoAgain = await actions.undoPayment(id);
    expect(undoAgain.ok).toBe(false);

    // Pagar de novo gera uma nova entrada ativa.
    await actions.registerPayment(id, '2026-11-06');
    expect(
      await Transaction.countDocuments({ monthlyId: id, deletedAt: null })
    ).toBe(1);
  });
});

describe('autorização', () => {
  it('jogador não consegue executar as actions', async () => {
    auth.current = { user: { id: adminId, role: 'jogador' } };
    await expect(actions.generateMonthlies(MONTH)).rejects.toThrow('Não autorizado');
    await expect(
      actions.registerPayment(new mongoose.Types.ObjectId().toString(), '2026-11-05')
    ).rejects.toThrow('Não autorizado');
    await expect(
      actions.updateMonthlySettings({}, settingsForm('30', '10'))
    ).rejects.toThrow('Não autorizado');
  });

  it('sem sessão também é bloqueado', async () => {
    auth.current = null;
    await expect(actions.undoPayment(new mongoose.Types.ObjectId().toString())).rejects.toThrow();
  });
});

/**
 * Testes de integração do caixa contra um MongoDB real em memória.
 */
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type FakeSession = { user: { id: string; role: 'comissao' | 'jogador' } } | null;

const auth = vi.hoisted(() => ({ current: null as FakeSession }));

class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
}));
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
let cash: typeof import('./cash');
let monthly: typeof import('./monthly');
let data: typeof import('@/lib/data/cash');
let Association: typeof import('@/lib/models/Association').default;
let Monthly: typeof import('@/lib/models/Monthly').default;
let Player: typeof import('@/lib/models/Player').default;
let Transaction: typeof import('@/lib/models/Transaction').default;

const adminId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGODB_URI = replSet.getUri();

  cash = await import('./cash');
  monthly = await import('./monthly');
  data = await import('@/lib/data/cash');
  Association = (await import('@/lib/models/Association')).default;
  Monthly = (await import('@/lib/models/Monthly')).default;
  Player = (await import('@/lib/models/Player')).default;
  Transaction = (await import('@/lib/models/Transaction')).default;

  const dbConnect = (await import('@/lib/mongodb')).default;
  await dbConnect();
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
});

function txForm(fields: Record<string, string>) {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.set(k, v);
  return form;
}

/** Cria um lançamento pela action e devolve a URL do redirect. */
async function create(fields: Record<string, string>) {
  try {
    const result = await cash.createTransaction({}, txForm(fields));
    return { redirect: null, result };
  } catch (error) {
    if (error instanceof RedirectSignal) return { redirect: error.url, result: null };
    throw error;
  }
}

const saida = (overrides: Record<string, string> = {}) => ({
  type: 'saida',
  category: 'Arbitragem',
  amount: '100,00',
  date: '2026-11-08',
  description: 'Arbitragem do jogo',
  ...overrides,
});

const entrada = (overrides: Record<string, string> = {}) => ({
  type: 'entrada',
  category: 'Doação',
  amount: '250',
  date: '2026-11-10',
  description: 'Doação para uniformes',
  ...overrides,
});

describe('createTransaction', () => {
  it('grava o lançamento e volta para o caixa do mês da data', async () => {
    const { redirect } = await create(saida());
    expect(redirect).toBe('/financial?month=2026-11');

    const tx = await Transaction.findOne().lean();
    expect(tx).toMatchObject({
      type: 'saida',
      category: 'Arbitragem',
      amountCents: 10000,
      description: 'Arbitragem do jogo',
      deletedAt: null,
    });
    expect(String(tx?.createdBy)).toBe(adminId);
    expect(tx?.date.toISOString()).toBe('2026-11-08T15:00:00.000Z');
  });

  it('devolve erros por campo e não grava nada quando inválido', async () => {
    const { result } = await create(
      entrada({ category: 'Mensalidade', amount: 'abc' })
    );
    expect(result?.errors?.amount).toBeDefined();
    expect(await Transaction.countDocuments()).toBe(0);
  });
});

describe('getCashSummary / listTransactions', () => {
  it('calcula o mês e o saldo acumulado atravessando meses', async () => {
    await create(entrada({ amount: '500', date: '2026-10-05' })); // outubro
    await create(saida({ amount: '80', date: '2026-10-20' })); // outubro
    await create(entrada({ amount: '250', date: '2026-11-10' })); // novembro
    await create(saida({ amount: '100', date: '2026-11-08' })); // novembro
    // Dezembro: gravado direto (a action recusa datas futuras). Não pode
    // entrar no resumo nem no acumulado de novembro.
    await Transaction.create({
      type: 'saida',
      category: 'Outros',
      amountCents: 99900,
      date: new Date('2026-12-01T15:00:00Z'),
      description: 'Lançamento de dezembro',
      createdBy: adminId,
    });

    const nov = await data.getCashSummary('2026-11');
    expect(nov.incomeCents).toBe(25000);
    expect(nov.expenseCents).toBe(10000);
    expect(nov.balanceCents).toBe(15000);
    // Outubro (+420) + novembro (+150)
    expect(nov.accumulatedCents).toBe(57000);

    const oct = await data.getCashSummary('2026-10');
    expect(oct.balanceCents).toBe(42000);
    expect(oct.accumulatedCents).toBe(42000);

    const rows = await data.listTransactions('2026-11', 'todas');
    expect(rows.map((r) => r.date.slice(0, 10))).toEqual([
      '2026-11-10',
      '2026-11-08',
    ]);
    const onlyOut = await data.listTransactions('2026-11', 'saida');
    expect(onlyOut).toHaveLength(1);
    expect(onlyOut[0].isAutomatic).toBe(false);
  });
});

describe('deleteTransaction', () => {
  it('tira o lançamento do caixa, mas mantém no banco com quem excluiu', async () => {
    await create(saida());
    const tx = await Transaction.findOne().lean();

    const result = await cash.deleteTransaction(String(tx!._id));
    expect(result.ok).toBe(true);

    const summary = await data.getCashSummary('2026-11');
    expect(summary.expenseCents).toBe(0);
    expect(await data.listTransactions('2026-11', 'todas')).toHaveLength(0);

    const stored = await Transaction.findById(tx!._id).lean();
    expect(stored?.deletedAt).toBeInstanceOf(Date);
    expect(String(stored?.deletedBy)).toBe(adminId);

    const again = await cash.deleteTransaction(String(tx!._id));
    expect(again.ok).toBe(false);
  });

  it('não exclui entradas geradas por mensalidade', async () => {
    await Association.create({
      name: 'Associação Teste',
      description: 'Teste',
      foundedDate: new Date('2020-01-01'),
      address: 'Rua Teste',
      phone: '71999990000',
      email: 'teste@example.com',
      monthlyFeeCents: 3000,
      dueDay: 10,
    });
    await Player.create({
      cpf: '12345678909',
      fullName: 'Carlos Ferreira',
      nickname: 'Carlão',
      position: 'Meia',
      shirtNumber: 10,
      birthDate: new Date('1990-01-01'),
      phone: '71999990000',
      address: 'Rua Teste, 1',
      createdBy: adminId,
    });
    await monthly.generateMonthlies('2026-11');
    const m = await Monthly.findOne().lean();
    await monthly.registerPayment(String(m!._id), '2026-11-05');

    const rows = await data.listTransactions('2026-11', 'todas');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      isAutomatic: true,
      monthlyMonth: '2026-11',
      category: 'Mensalidade',
    });

    const result = await cash.deleteTransaction(rows[0].id);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/Mensalidades/);

    // Desfazer a mensalidade tira a entrada do caixa.
    await monthly.undoPayment(String(m!._id));
    expect((await data.getCashSummary('2026-11')).incomeCents).toBe(0);
  });
});

describe('autorização', () => {
  it('jogador não cria nem exclui lançamentos', async () => {
    auth.current = { user: { id: adminId, role: 'jogador' } };
    await expect(cash.createTransaction({}, txForm(saida()))).rejects.toThrow(
      'Não autorizado'
    );
    await expect(
      cash.deleteTransaction(new mongoose.Types.ObjectId().toString())
    ).rejects.toThrow('Não autorizado');
    expect(await Transaction.countDocuments()).toBe(0);
  });
});

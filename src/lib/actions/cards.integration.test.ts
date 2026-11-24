import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearModels,
  initModels,
  playerData,
  startTestDb,
  stopTestDb,
} from '@/test/mongo';

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
vi.mock('@/lib/session', () => ({
  assertRole: vi.fn(async (role: string) => {
    if (!auth.current || auth.current.user.role !== role) {
      throw new Error('Não autorizado');
    }
    return auth.current;
  }),
}));

let actions: typeof import('./cards');
let cash: typeof import('./cash');
let data: typeof import('@/lib/data/cards');
let cashData: typeof import('@/lib/data/cash');
let Card: typeof import('@/lib/models/Card').default;
let Player: typeof import('@/lib/models/Player').default;
let Transaction: typeof import('@/lib/models/Transaction').default;

const adminId = new mongoose.Types.ObjectId().toString();
let playerId = '';

beforeAll(async () => {
  await startTestDb();
  actions = await import('./cards');
  cash = await import('./cash');
  data = await import('@/lib/data/cards');
  cashData = await import('@/lib/data/cash');
  Card = (await import('@/lib/models/Card')).default;
  Player = (await import('@/lib/models/Player')).default;
  Transaction = (await import('@/lib/models/Transaction')).default;
  await initModels(Card as never, Player as never, Transaction as never);
}, 180_000);

afterAll(stopTestDb);

beforeEach(async () => {
  auth.current = { user: { id: adminId, role: 'comissao' } };
  await clearModels(Card as never, Player as never, Transaction as never);
  const p = await Player.create(playerData({ createdBy: adminId, nickname: 'Carlão' }));
  playerId = String(p._id);
});

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

async function createCard(fields: Record<string, string> = {}) {
  try {
    const result = await actions.createCard(
      {},
      form({
        playerId,
        color: 'amarelo',
        amount: '15',
        date: '2026-11-08',
        description: 'Jogo contra o Mar Grande',
        returnTo: `/players/${playerId}`,
        ...fields,
      })
    );
    return { result, redirect: null as string | null };
  } catch (error) {
    if (error instanceof RedirectSignal) return { result: null, redirect: error.url };
    throw error;
  }
}

describe('createCard', () => {
  it('registra a multa pendente e volta para a ficha', async () => {
    const { redirect } = await createCard();
    expect(redirect).toBe(`/players/${playerId}`);

    const card = await Card.findOne().lean();
    expect(card).toMatchObject({
      color: 'amarelo',
      amountCents: 1500,
      status: 'pendente',
      description: 'Jogo contra o Mar Grande',
    });
  });

  it('ignora destinos de retorno externos', async () => {
    const { redirect } = await createCard({ returnTo: 'https://exemplo.com' });
    expect(redirect).toBe('/financial/cards');
  });

  it('valida jogador, cor e valor', async () => {
    const { result } = await createCard({ playerId: '', color: 'azul', amount: '0' });
    expect(result?.errors?.playerId).toBe('Escolha o jogador');
    expect(result?.errors?.color).toBeDefined();
    expect(result?.errors?.amount).toBeDefined();
    expect(await Card.countDocuments()).toBe(0);
  });
});

describe('payCard / undoCardPayment / deleteCard', () => {
  async function pendingCardId() {
    await createCard();
    return String((await Card.findOne().lean())!._id);
  }

  it('pagar lança uma entrada "Multa" no caixa; pagar de novo falha', async () => {
    const id = await pendingCardId();

    const paid = await actions.payCard(id, '2026-11-10');
    expect(paid.ok).toBe(true);

    const tx = await Transaction.find({ cardId: id }).lean();
    expect(tx).toHaveLength(1);
    expect(tx[0]).toMatchObject({ type: 'entrada', category: 'Multa', amountCents: 1500 });
    expect(tx[0].description).toContain('Carlão');

    expect((await actions.payCard(id, '2026-11-10')).ok).toBe(false);
    expect(await Transaction.countDocuments({ cardId: id })).toBe(1);

    const rows = await cashData.listTransactions('2026-11', 'todas');
    expect(rows[0]).toMatchObject({ isAutomatic: true, fromCard: true });
  });

  it('a entrada da multa não pode ser excluída pelo caixa', async () => {
    const id = await pendingCardId();
    await actions.payCard(id, '2026-11-10');
    const tx = await Transaction.findOne({ cardId: id }).lean();

    const result = await cash.deleteTransaction(String(tx!._id));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/Cartões/);
  });

  it('desfazer volta a pendente e tira a entrada do caixa', async () => {
    const id = await pendingCardId();
    await actions.payCard(id, '2026-11-10');

    const undo = await actions.undoCardPayment(id);
    expect(undo.ok).toBe(true);
    expect((await Card.findById(id).lean())?.status).toBe('pendente');
    expect((await cashData.getCashSummary('2026-11')).incomeCents).toBe(0);
  });

  it('só exclui multas não pagas', async () => {
    const id = await pendingCardId();
    await actions.payCard(id, '2026-11-10');
    expect((await actions.deleteCard(id)).ok).toBe(false);

    await actions.undoCardPayment(id);
    expect((await actions.deleteCard(id)).ok).toBe(true);
    expect(await Card.countDocuments()).toBe(0);
  });
});

describe('consultas', () => {
  it('resume pendentes e pagas e filtra por jogador', async () => {
    await createCard({ amount: '15' });
    await createCard({ color: 'vermelho', amount: '30' });
    const [first] = await Card.find().sort({ amountCents: 1 }).lean();
    await actions.payCard(String(first._id), '2026-11-10');

    const summary = await data.getCardSummary();
    expect(summary).toEqual({
      pendingCount: 1,
      pendingCents: 3000,
      paidCount: 1,
      paidCents: 1500,
    });

    expect(await data.listCards('pendente')).toHaveLength(1);
    expect(await data.listCards('todos')).toHaveLength(2);
    const mine = await data.listPlayerCards(playerId);
    expect(mine.map((c) => c.player.nickname)).toEqual(['Carlão', 'Carlão']);
  });
});

describe('autorização', () => {
  it('jogador não registra, paga nem exclui cartões', async () => {
    await createCard();
    const id = String((await Card.findOne().lean())!._id);
    auth.current = { user: { id: adminId, role: 'jogador' } };

    await expect(actions.payCard(id, '2026-11-10')).rejects.toThrow();
    await expect(actions.deleteCard(id)).rejects.toThrow();
    await expect(actions.createCard({}, form({ playerId }))).rejects.toThrow();
  });
});

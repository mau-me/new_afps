import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearModels,
  initModels,
  playerData,
  startTestDb,
  stopTestDb,
} from '@/test/mongo';

let reports: typeof import('./reports');
let Card: typeof import('@/lib/models/Card').default;
let Monthly: typeof import('@/lib/models/Monthly').default;
let Player: typeof import('@/lib/models/Player').default;
let Transaction: typeof import('@/lib/models/Transaction').default;

const adminId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  await startTestDb();
  reports = await import('./reports');
  Card = (await import('@/lib/models/Card')).default;
  Monthly = (await import('@/lib/models/Monthly')).default;
  Player = (await import('@/lib/models/Player')).default;
  Transaction = (await import('@/lib/models/Transaction')).default;
  await initModels(Card as never, Monthly as never, Player as never, Transaction as never);
}, 180_000);

afterAll(stopTestDb);

beforeEach(() =>
  clearModels(Card as never, Monthly as never, Player as never, Transaction as never)
);

function tx(type: 'entrada' | 'saida', category: string, cents: number, iso: string, extra = {}) {
  return {
    type,
    category,
    amountCents: cents,
    date: new Date(iso),
    description: `${category} ${iso}`,
    createdBy: adminId,
    ...extra,
  };
}

describe('getMonthReport', () => {
  it('calcula saldo anterior, entradas e saídas por categoria e saldo final', async () => {
    await Transaction.create([
      tx('entrada', 'Doação', 50000, '2026-10-05T15:00:00Z'), // outubro
      tx('saida', 'Arbitragem', 8000, '2026-10-20T15:00:00Z'), // outubro
      tx('entrada', 'Mensalidade', 3000, '2026-11-05T15:00:00Z'),
      tx('entrada', 'Mensalidade', 3000, '2026-11-06T15:00:00Z'),
      tx('saida', 'Arbitragem', 10000, '2026-11-08T15:00:00Z'),
      tx('saida', 'Material esportivo', 4500, '2026-11-09T15:00:00Z'),
      // Excluído: não pode entrar em nada.
      tx('saida', 'Outros', 99900, '2026-11-10T15:00:00Z', {
        deletedAt: new Date(),
        deletedBy: adminId,
      }),
    ]);

    const r = await reports.getMonthReport('2026-11');
    expect(r.openingCents).toBe(42000);
    expect(r.incomeCents).toBe(6000);
    expect(r.expenseCents).toBe(14500);
    expect(r.closingCents).toBe(42000 + 6000 - 14500);

    expect(r.incomeByCategory).toEqual([
      { category: 'Mensalidade', cents: 6000, count: 2 },
    ]);
    expect(r.expenseByCategory).toEqual([
      { category: 'Arbitragem', cents: 10000, count: 1 },
      { category: 'Material esportivo', cents: 4500, count: 1 },
    ]);
    expect(r.transactions).toHaveLength(4);
  });
});

describe('listDebtors', () => {
  it('agrupa mensalidades vencidas por jogador, da maior dívida para a menor', async () => {
    const a = await Player.create(playerData({ createdBy: adminId, nickname: 'Carlão' }));
    const b = await Player.create(playerData({ createdBy: adminId, nickname: 'Paredão' }));
    const base = { amountCents: 3000, createdBy: adminId };

    await Monthly.create([
      { ...base, playerId: a._id, referenceMonth: '2026-09', dueDate: new Date('2026-09-11T02:59:59Z') },
      { ...base, playerId: a._id, referenceMonth: '2026-10', dueDate: new Date('2026-10-11T02:59:59Z') },
      { ...base, playerId: b._id, referenceMonth: '2026-10', dueDate: new Date('2026-10-11T02:59:59Z') },
      // Paga: não conta.
      { ...base, playerId: b._id, referenceMonth: '2026-09', dueDate: new Date('2026-09-11T02:59:59Z'), status: 'pago' },
      // Ainda no prazo: não conta.
      { ...base, playerId: b._id, referenceMonth: '2026-11', dueDate: new Date('2026-12-11T02:59:59Z') },
    ]);

    const debtors = await reports.listDebtors(new Date('2026-11-24T12:00:00Z'));
    expect(debtors).toEqual([
      expect.objectContaining({
        nickname: 'Carlão',
        months: ['2026-09', '2026-10'],
        totalCents: 6000,
      }),
      expect.objectContaining({
        nickname: 'Paredão',
        months: ['2026-10'],
        totalCents: 3000,
      }),
    ]);
  });
});

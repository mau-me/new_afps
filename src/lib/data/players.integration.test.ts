import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  clearModels,
  initModels,
  playerData,
  startTestDb,
  stopTestDb,
} from '@/test/mongo';

let data: typeof import('./players');
let Monthly: typeof import('@/lib/models/Monthly').default;
let Player: typeof import('@/lib/models/Player').default;

const adminId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  await startTestDb();
  data = await import('./players');
  Monthly = (await import('@/lib/models/Monthly')).default;
  Player = (await import('@/lib/models/Player')).default;
  await initModels(Monthly as never, Player as never);
}, 180_000);

afterAll(stopTestDb);

beforeEach(() => clearModels(Monthly as never, Player as never));

describe('getPlayerByUserId / getPlayerById', () => {
  it('a área do jogador encontra a ficha pela conta e inclui dados pessoais', async () => {
    const userId = new mongoose.Types.ObjectId();
    await Player.create(playerData({ createdBy: adminId, userId, nickname: 'Carlão' }));

    const profile = await data.getPlayerByUserId(String(userId));
    expect(profile).toMatchObject({ nickname: 'Carlão', hasAccount: true });
    expect(profile?.cpf).toMatch(/^\d{11}$/);
    expect(profile?.phone).toBeDefined();

    expect(await data.getPlayerByUserId(new mongoose.Types.ObjectId().toString())).toBeNull();
    expect(await data.getPlayerByUserId('invalido')).toBeNull();
  });

  it('sem permissão, não devolve CPF, telefone, endereço nem nascimento', async () => {
    const p = await Player.create(playerData({ createdBy: adminId }));
    const profile = await data.getPlayerById(String(p._id), { includePersonal: false });
    expect(profile).not.toBeNull();
    expect(profile).not.toHaveProperty('cpf');
    expect(profile).not.toHaveProperty('phone');
    expect(profile).not.toHaveProperty('address');
    expect(profile).not.toHaveProperty('birthDate');
  });
});

describe('getPlayerFinancials', () => {
  it('soma o que está em aberto e conta as vencidas', async () => {
    const p = await Player.create(playerData({ createdBy: adminId }));
    const base = { playerId: p._id, amountCents: 3000, createdBy: adminId };
    await Monthly.create([
      { ...base, referenceMonth: '2026-09', dueDate: new Date('2026-09-11T02:59:59Z'), status: 'pago', paymentDate: new Date('2026-09-05T15:00:00Z') },
      { ...base, referenceMonth: '2026-10', dueDate: new Date('2026-10-11T02:59:59Z'), status: 'em_aberto' },
      { ...base, referenceMonth: '2026-11', dueDate: new Date('2026-12-11T02:59:59Z'), status: 'em_aberto' },
    ]);

    const now = new Date('2026-11-24T12:00:00Z');
    const result = await data.getPlayerFinancials(String(p._id), now);

    expect(result.monthlies.map((m) => m.referenceMonth)).toEqual([
      '2026-11',
      '2026-10',
      '2026-09',
    ]);
    expect(result.openCount).toBe(2);
    expect(result.openCents).toBe(6000);
    expect(result.overdueCount).toBe(1);
    expect(result.paidCount).toBe(1);
  });
});

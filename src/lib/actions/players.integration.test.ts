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

let actions: typeof import('./players');
let Player: typeof import('@/lib/models/Player').default;
let AllowedUser: typeof import('@/lib/models/AllowedUser').default;
let User: typeof import('@/lib/models/User').default;

const adminId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  await startTestDb();
  actions = await import('./players');
  Player = (await import('@/lib/models/Player')).default;
  AllowedUser = (await import('@/lib/models/AllowedUser')).default;
  User = (await import('@/lib/models/User')).default;
  await initModels(Player as never, AllowedUser as never, User as never);
}, 180_000);

afterAll(stopTestDb);

beforeEach(async () => {
  auth.current = { user: { id: adminId, role: 'comissao' } };
  await clearModels(Player as never, AllowedUser as never, User as never);
});

const formFields = {
  fullName: 'Carlos Ferreira',
  nickname: 'Carlão',
  cpf: '555.666.777-20',
  position: 'Meia',
  shirtNumber: '10',
  birthDate: '1990-05-20',
  phone: '(71) 99999-0000',
  address: 'Rua Alto do Verão, 10',
};

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

async function run<T>(promise: Promise<T>) {
  try {
    return { result: await promise, redirect: null as string | null };
  } catch (error) {
    if (error instanceof RedirectSignal) return { result: null, redirect: error.url };
    throw error;
  }
}

describe('createPlayer', () => {
  it('cadastra a ficha e libera o CPF para criar conta', async () => {
    const { redirect } = await run(actions.createPlayer({}, form(formFields)));
    expect(redirect).toBe('/players');

    const player = await Player.findOne().lean();
    expect(player).toMatchObject({ cpf: '55566677720', nickname: 'Carlão' });
    const allowed = await AllowedUser.findOne({ cpf: '55566677720' }).lean();
    expect(allowed?.isUsed).toBe(false);
  });
});

describe('updatePlayer', () => {
  it('atualiza a ficha e move a liberação de cadastro junto com o CPF', async () => {
    const p = await Player.create(
      playerData({ createdBy: adminId, cpf: '12345678909' })
    );
    await AllowedUser.create({ cpf: '12345678909', name: 'Antigo' });

    const { redirect } = await run(
      actions.updatePlayer(String(p._id), {}, form(formFields))
    );
    expect(redirect).toBe(`/players/${p._id}`);

    const updated = await Player.findById(p._id).lean();
    expect(updated).toMatchObject({
      cpf: '55566677720',
      nickname: 'Carlão',
      shirtNumber: 10,
      phone: '71999990000',
    });
    expect(await AllowedUser.exists({ cpf: '12345678909' })).toBeNull();
    expect(await AllowedUser.exists({ cpf: '55566677720' })).not.toBeNull();
  });

  it('bloqueia troca de CPF quando a ficha já tem conta', async () => {
    const userId = new mongoose.Types.ObjectId();
    const p = await Player.create(
      playerData({ createdBy: adminId, cpf: '12345678909', userId })
    );

    const { result } = await run(
      actions.updatePlayer(String(p._id), {}, form(formFields))
    );
    expect(result?.errors?.cpf).toMatch(/bloqueado/);
    expect((await Player.findById(p._id).lean())?.cpf).toBe('12345678909');
  });

  it('permite editar o resto da ficha mantendo o CPF de quem tem conta', async () => {
    const userId = new mongoose.Types.ObjectId();
    const p = await Player.create(
      playerData({ createdBy: adminId, cpf: '55566677720', userId })
    );
    const { redirect } = await run(
      actions.updatePlayer(String(p._id), {}, form({ ...formFields, nickname: 'Carlinhos' }))
    );
    expect(redirect).not.toBeNull();
    expect((await Player.findById(p._id).lean())?.nickname).toBe('Carlinhos');
  });

  it('não aceita CPF de outro jogador', async () => {
    await Player.create(playerData({ createdBy: adminId, cpf: '55566677720' }));
    const p = await Player.create(playerData({ createdBy: adminId, cpf: '12345678909' }));

    const { result } = await run(
      actions.updatePlayer(String(p._id), {}, form(formFields))
    );
    expect(result?.errors?.cpf).toBe('CPF já cadastrado');
  });
});

describe('setPlayerActive', () => {
  it('desativa e reativa', async () => {
    const p = await Player.create(playerData({ createdBy: adminId, nickname: 'Paredão' }));

    const off = await actions.setPlayerActive(String(p._id), false);
    expect(off.ok).toBe(true);
    expect(off.message).toMatch(/desativado/);
    expect((await Player.findById(p._id).lean())?.isActive).toBe(false);

    const on = await actions.setPlayerActive(String(p._id), true);
    expect(on.message).toMatch(/reativado/);
    expect((await Player.findById(p._id).lean())?.isActive).toBe(true);
  });

  it('jogador não pode editar nem desativar', async () => {
    const p = await Player.create(playerData({ createdBy: adminId }));
    auth.current = { user: { id: adminId, role: 'jogador' } };
    await expect(actions.setPlayerActive(String(p._id), false)).rejects.toThrow();
    await expect(
      actions.updatePlayer(String(p._id), {}, form(formFields))
    ).rejects.toThrow();
  });
});

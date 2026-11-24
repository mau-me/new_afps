import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  associationData,
  clearModels,
  initModels,
  startTestDb,
  stopTestDb,
} from '@/test/mongo';

type FakeSession = { user: { id: string; role: 'comissao' | 'jogador' } } | null;
const auth = vi.hoisted(() => ({ current: null as FakeSession }));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/session', () => ({
  assertRole: vi.fn(async (role: string) => {
    if (!auth.current || auth.current.user.role !== role) {
      throw new Error('Não autorizado');
    }
    return auth.current;
  }),
}));

let settings: typeof import('./settings');
let users: typeof import('./auth');
let authOptions: typeof import('@/lib/auth').authOptions;
let Association: typeof import('@/lib/models/Association').default;
let AllowedUser: typeof import('@/lib/models/AllowedUser').default;
let User: typeof import('@/lib/models/User').default;

let adminId = '';

beforeAll(async () => {
  await startTestDb();
  settings = await import('./settings');
  users = await import('./auth');
  authOptions = (await import('@/lib/auth')).authOptions;
  Association = (await import('@/lib/models/Association')).default;
  AllowedUser = (await import('@/lib/models/AllowedUser')).default;
  User = (await import('@/lib/models/User')).default;
  await initModels(Association as never, AllowedUser as never, User as never);
}, 180_000);

afterAll(stopTestDb);

beforeEach(async () => {
  await clearModels(Association as never, AllowedUser as never, User as never);
  await Association.create(associationData);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'senhaforte',
    role: 'comissao',
  });
  adminId = String(admin._id);
  auth.current = { user: { id: adminId, role: 'comissao' } };
});

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe('updateAssociation', () => {
  const fields = {
    name: 'Associação de Porto dos Santos',
    description: 'Futebol e união na comunidade de Porto dos Santos.',
    address: 'Rua Alto do Verão, Itaparica',
    phone: '(71) 98888-7777',
    email: 'Contato@Exemplo.com',
    gameSchedule: 'Domingos às 8h',
    commission: 'Ana\n\n  Bruno  \nCarla',
    facebook: '',
    twitter: '',
    instagram: 'https://instagram.com/afps',
  };

  it('salva os dados normalizados', async () => {
    const result = await settings.updateAssociation({}, form(fields));
    expect(result.ok).toBe(true);

    const a = await Association.findOne().lean();
    expect(a).toMatchObject({
      phone: '71988887777',
      email: 'contato@exemplo.com',
      commission: ['Ana', 'Bruno', 'Carla'],
      gameSchedule: 'Domingos às 8h',
    });
    expect(a?.socialMedia?.instagram).toBe('https://instagram.com/afps');
  });

  it('recusa links que não são https', async () => {
    const result = await settings.updateAssociation(
      {},
      form({ ...fields, facebook: 'javascript:alert(1)' })
    );
    expect(result.errors?.facebook).toMatch(/https/);
  });
});

describe('updateFees', () => {
  it('salva mensalidade, vencimento e multas padrão', async () => {
    const result = await settings.updateFees(
      {},
      form({ monthlyFee: '30', dueDay: '5', yellowCardFee: '10,00', redCardFee: '' })
    );
    expect(result.ok).toBe(true);
    const a = await Association.findOne().lean();
    expect(a).toMatchObject({
      monthlyFeeCents: 3000,
      dueDay: 5,
      yellowCardFeeCents: 1000,
      redCardFeeCents: 0,
    });
  });
});

describe('CPFs liberados', () => {
  it('libera, recusa duplicado e só remove os não usados', async () => {
    const ok = await settings.allowCpf({}, form({ name: 'Bruno', cpf: '123.456.789-09' }));
    expect(ok.ok).toBe(true);

    const dup = await settings.allowCpf({}, form({ name: 'Outro', cpf: '12345678909' }));
    expect(dup.errors?.cpf).toMatch(/já está/);

    const used = await AllowedUser.create({ cpf: '98765432100', name: 'Usado', isUsed: true });
    expect((await settings.revokeCpf(String(used._id))).ok).toBe(false);

    const free = await AllowedUser.findOne({ cpf: '12345678909' }).lean();
    expect((await settings.revokeCpf(String(free!._id))).ok).toBe(true);
    expect(await AllowedUser.countDocuments()).toBe(1);
  });
});

describe('usuários', () => {
  it('cria conta sem devolver a senha ao formulário', async () => {
    const result = await users.createUser(
      {},
      form({ name: 'Carla', email: 'carla@example.com', password: 'curta', role: 'comissao' })
    );
    expect(result.errors?.password).toBeDefined();
    expect(result.values?.password).toBe('');

    const ok = await users.createUser(
      {},
      form({ name: 'Carla', email: 'carla@example.com', password: 'senhaforte', role: 'comissao' })
    );
    expect(ok.ok).toBe(true);
    expect(await User.exists({ email: 'carla@example.com', role: 'comissao' })).not.toBeNull();
  });

  it('não deixa a comissão ficar sem ninguém nem mexer na própria conta', async () => {
    expect((await users.updateUserStatus(adminId, false)).ok).toBe(false);
    expect((await users.setUserRole(adminId, 'jogador')).ok).toBe(false);

    const other = await User.create({
      name: 'Bruno',
      email: 'bruno@example.com',
      password: 'senhaforte',
      role: 'comissao',
    });
    // Com dois na comissão, dá para rebaixar o outro…
    expect((await users.setUserRole(String(other._id), 'jogador')).ok).toBe(true);
    // …e promover de volta.
    expect((await users.setUserRole(String(other._id), 'comissao')).ok).toBe(true);
  });

  it('desativar bloqueia a sessão na próxima checagem do token', async () => {
    const player = await User.create({
      name: 'Davi',
      email: 'davi@example.com',
      password: 'senhaforte',
      role: 'jogador',
    });
    const jwt = authOptions.callbacks!.jwt!;
    const token = { sub: String(player._id), role: 'jogador' as const };

    const before = await jwt({ token: { ...token }, user: undefined as never, account: null });
    expect(before.disabled).toBe(false);

    expect((await users.updateUserStatus(String(player._id), false)).ok).toBe(true);
    const after = await jwt({ token: { ...token }, user: undefined as never, account: null });
    expect(after.disabled).toBe(true);

    // Promoção também vale sem novo login.
    await users.updateUserStatus(String(player._id), true);
    await users.setUserRole(String(player._id), 'comissao');
    const promoted = await jwt({ token: { ...token }, user: undefined as never, account: null });
    expect(promoted).toMatchObject({ disabled: false, role: 'comissao' });
  });

  it('conta removida do banco também fica bloqueada', async () => {
    const jwt = authOptions.callbacks!.jwt!;
    const result = await jwt({
      token: { sub: new mongoose.Types.ObjectId().toString() },
      user: undefined as never,
      account: null,
    });
    expect(result.disabled).toBe(true);
  });
});

describe('autorização', () => {
  it('jogador não altera configurações nem usuários', async () => {
    auth.current = { user: { id: adminId, role: 'jogador' } };
    await expect(settings.updateFees({}, form({ dueDay: '5' }))).rejects.toThrow();
    await expect(settings.allowCpf({}, form({}))).rejects.toThrow();
    await expect(users.setUserRole(adminId, 'jogador')).rejects.toThrow();
  });
});

/**
 * Banco MongoDB em memória para testes de integração (replica set, para que
 * transações funcionem). Os mocks de módulos (vi.mock) ficam em cada arquivo
 * de teste; aqui fica só o ciclo de vida do banco.
 */
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet: MongoMemoryReplSet | null = null;

export async function startTestDb() {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGODB_URI = replSet.getUri();
  // Importa depois de definir MONGODB_URI (lido ao carregar o módulo).
  const dbConnect = (await import('@/lib/mongodb')).default;
  await dbConnect();
}

export async function stopTestDb() {
  await mongoose.disconnect();
  await replSet?.stop();
  replSet = null;
}

/** Garante índices e coleções (necessário antes de usar transações). */
export async function initModels(...models: mongoose.Model<never>[]) {
  await Promise.all(models.map((m) => m.init()));
}

export async function clearModels(...models: mongoose.Model<never>[]) {
  await Promise.all(models.map((m) => m.deleteMany()));
}

/** Dados mínimos válidos de um jogador. */
let seq = 0;
export function playerData(
  overrides: Record<string, unknown> & { createdBy: string }
) {
  seq++;
  return {
    cpf: String(20000000000 + seq),
    fullName: `Jogador ${seq} da Silva`,
    nickname: `Jogador ${seq}`,
    position: 'Meia',
    shirtNumber: (seq % 99) + 1,
    birthDate: new Date('1990-01-01'),
    phone: '71999990000',
    address: 'Rua Teste, 1',
    ...overrides,
  };
}

export const associationData = {
  name: 'Associação Teste',
  description: 'Teste',
  foundedDate: new Date('2020-01-01'),
  address: 'Rua Teste',
  phone: '71999990000',
  email: 'teste@example.com',
};

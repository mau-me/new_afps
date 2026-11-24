/**
 * Situação atual de uma conta (ativa? qual papel?), com cache curto em memória.
 *
 * A sessão é um JWT válido por dias; sem esta checagem, uma conta desativada
 * ou rebaixada continuaria com acesso até o token expirar. O callback `jwt`
 * do NextAuth consulta esta função a cada requisição no servidor; o cache
 * evita uma ida ao banco por requisição.
 */
import dbConnect from '@/lib/mongodb';
import User, { type UserRole } from '@/lib/models/User';

const TTL_MS = 60_000;

type Status = { isActive: boolean; role: UserRole };
const cache = new Map<string, Status & { at: number }>();

export async function getUserStatus(userId: string): Promise<Status | null> {
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return { isActive: cached.isActive, role: cached.role };
  }

  await dbConnect();
  const user = await User.findById(userId).select('isActive role').lean();
  if (!user) {
    cache.delete(userId);
    return null;
  }

  const status = { isActive: user.isActive, role: user.role };
  cache.set(userId, { ...status, at: Date.now() });
  return status;
}

/** Chame ao mudar papel ou situação de uma conta (efeito imediato nesta instância). */
export function invalidateUserStatus(userId: string) {
  cache.delete(userId);
}

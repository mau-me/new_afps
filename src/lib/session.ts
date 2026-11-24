import 'server-only';

import { getServerSession, type Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import type { UserRole } from '@/lib/models/User';

export function getSession() {
  return getServerSession(authOptions);
}

/** Para páginas: redireciona para /login se não houver sessão. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/** Para páginas: exige papel; senão manda para o dashboard. */
export async function requireRole(role: UserRole): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== role) redirect('/dashboard');
  return session;
}

export class AuthorizationError extends Error {
  constructor(message = 'Não autorizado') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Para server actions: lança erro se não houver sessão ou papel adequado.
 * Server actions são endpoints públicos — SEMPRE chame isto no início delas.
 */
export async function assertRole(role: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AuthorizationError('Faça login para continuar');
  if (session.user.role !== role) throw new AuthorizationError();
  return session;
}

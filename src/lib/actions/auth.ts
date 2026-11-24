'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import User, { type UserRole } from '@/lib/models/User';
import { invalidateUserStatus } from '@/lib/user-status';
import { assertRole } from '@/lib/session';
import {
  USER_ROLE_VALUES,
  createUserSchema,
  fieldErrors,
  objectIdSchema,
} from '@/lib/validation';

/*
 * Server actions são endpoints HTTP públicos: qualquer um pode chamá-las.
 * Toda action aqui exige sessão da comissão via `assertRole`.
 */

export type UserFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ActionResult = { ok: boolean; message: string };

/** Cria uma conta diretamente (ex.: novo membro da comissão). */
export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await assertRole('comissao');

  const values = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    role: String(formData.get('role') ?? ''),
  };
  const parsed = createUserSchema.safeParse(values);
  // A senha nunca volta para o formulário.
  const safeValues = { ...values, password: '' };
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: safeValues };
  }

  await dbConnect();
  if (await User.exists({ email: parsed.data.email })) {
    return { errors: { email: 'Já existe uma conta com este email' }, values: safeValues };
  }

  await User.create(parsed.data);
  revalidatePath('/settings/users');
  return { ok: true, message: `Conta de ${parsed.data.name} criada.` };
}

/** Quantos membros ativos da comissão existem, sem contar `exceptId`. */
async function otherActiveCommission(exceptId: string) {
  return User.countDocuments({ role: 'comissao', isActive: true, _id: { $ne: exceptId } });
}

export async function updateUserStatus(
  userId: string,
  isActive: boolean
): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(userId);
  if (!id.success) return { ok: false, message: 'Usuário inválido.' };
  if (id.data === session.user.id && !isActive) {
    return { ok: false, message: 'Você não pode desativar a própria conta.' };
  }

  await dbConnect();
  const user = await User.findById(id.data).select('role name').lean();
  if (!user) return { ok: false, message: 'Usuário não encontrado.' };

  if (!isActive && user.role === 'comissao' && (await otherActiveCommission(id.data)) === 0) {
    return { ok: false, message: 'É preciso manter pelo menos um membro ativo na comissão.' };
  }

  await User.updateOne({ _id: id.data }, { $set: { isActive: Boolean(isActive) } });
  invalidateUserStatus(id.data);
  revalidatePath('/settings/users');

  return {
    ok: true,
    message: isActive
      ? `Conta de ${user.name} reativada.`
      : `Conta de ${user.name} desativada. O acesso é bloqueado em instantes.`,
  };
}

export async function setUserRole(userId: string, role: UserRole): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(userId);
  if (!id.success || !USER_ROLE_VALUES.includes(role)) {
    return { ok: false, message: 'Dados inválidos.' };
  }
  if (id.data === session.user.id) {
    return { ok: false, message: 'Você não pode mudar o próprio papel.' };
  }

  await dbConnect();
  const user = await User.findById(id.data).select('role name').lean();
  if (!user) return { ok: false, message: 'Usuário não encontrado.' };

  if (role === 'jogador' && user.role === 'comissao' && (await otherActiveCommission(id.data)) === 0) {
    return { ok: false, message: 'É preciso manter pelo menos um membro ativo na comissão.' };
  }

  await User.updateOne({ _id: id.data }, { $set: { role } });
  invalidateUserStatus(id.data);
  revalidatePath('/settings/users');

  return {
    ok: true,
    message:
      role === 'comissao'
        ? `${user.name} agora faz parte da comissão.`
        : `${user.name} agora é jogador.`,
  };
}

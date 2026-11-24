'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import User, { USER_ROLES } from '@/lib/models/User';
import { assertRole } from '@/lib/session';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation';

/*
 * Server actions são endpoints HTTP públicos: qualquer um pode chamá-las.
 * Toda action aqui exige sessão da comissão via `assertRole`.
 */

const createUserSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(128),
  role: z.enum(USER_ROLES),
});

export async function createUser(formData: FormData) {
  await assertRole('comissao');

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message };
  }

  await dbConnect();

  if (await User.exists({ email: parsed.data.email })) {
    return { success: false, message: 'Usuário já existe com este email' };
  }

  await User.create(parsed.data);
  revalidatePath('/settings/users');

  return { success: true, message: 'Usuário criado com sucesso' };
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const session = await assertRole('comissao');

  if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(userId).success) {
    return { success: false, message: 'Usuário inválido' };
  }
  if (userId === session.user.id && !isActive) {
    return { success: false, message: 'Você não pode desativar a si mesmo' };
  }

  await dbConnect();
  await User.findByIdAndUpdate(userId, { isActive: Boolean(isActive) });
  revalidatePath('/settings/users');

  return { success: true, message: 'Status do usuário atualizado' };
}

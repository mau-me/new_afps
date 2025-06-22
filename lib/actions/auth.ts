'use server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'comissao' | 'jogador';

  if (!name || !email || !password || !role) {
    throw new Error('Todos os campos são obrigatórios');
  }

  await dbConnect();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Usuário já existe com este email');
  }

  // Create new user
  const user = new User({
    name,
    email,
    password,
    role,
  });

  await user.save();
  revalidatePath('/settings/users');

  return { success: true, message: 'Usuário criado com sucesso' };
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  await dbConnect();

  await User.findByIdAndUpdate(userId, { isActive });
  revalidatePath('/settings/users');

  return { success: true, message: 'Status do usuário atualizado' };
}

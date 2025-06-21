'use server';

import connectToDatabase from '@/lib/db';
import Player from '@/lib/models/Player';
import User from '@/lib/models/User';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

export async function createPlayer(formData) {
  await connectToDatabase();

  const playerData = {
    name: formData.get('name'),
    nickname: formData.get('nickname'),
    position: formData.get('position'),
    shirtNumber: formData.get('shirtNumber'),
    birthDate: formData.get('birthDate'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    status: 'active',
  };

  const player = await Player.create(playerData);

  const hashedPassword = await bcrypt.hash(formData.get('password'), 10);
  const user = await User.create({
    cpf: formData.get('cpf'),
    email: playerData.email,
    password: hashedPassword,
    role: 'jogador',
    playerId: player._id,
  });

  revalidatePath('/players');
  return { success: true, playerId: player._id };
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import AllowedUser from '@/lib/models/AllowedUser';
import User from '@/lib/models/User';
import { assertRole } from '@/lib/session';
import { fieldErrors, playerSchema } from '@/lib/validation';

export type CreatePlayerState = {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

/**
 * Cadastra um jogador (somente comissão).
 * Também libera o CPF para o jogador criar sua conta e, se a conta já
 * existir, vincula a ficha a ela.
 */
export async function createPlayer(
  _prev: CreatePlayerState,
  formData: FormData
): Promise<CreatePlayerState> {
  const session = await assertRole('comissao');

  const values = Object.fromEntries(
    [...formData.entries()].map(([k, v]) => [k, String(v)])
  );
  const parsed = playerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: 'Corrija os campos destacados.',
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const data = parsed.data;

  try {
    await dbConnect();

    if (await Player.exists({ cpf: data.cpf })) {
      return {
        message: 'Já existe um jogador com este CPF.',
        errors: { cpf: 'CPF já cadastrado' },
        values,
      };
    }

    const existingUser = await User.findOne({ cpf: data.cpf }).select('_id');

    await Player.create({
      ...data,
      userId: existingUser?._id,
      createdBy: session.user.id,
    });

    // Libera o CPF para cadastro de conta (se ainda não estiver liberado).
    await AllowedUser.updateOne(
      { cpf: data.cpf },
      {
        $setOnInsert: {
          cpf: data.cpf,
          name: data.fullName,
          isUsed: Boolean(existingUser),
          ...(existingUser ? { usedBy: existingUser._id } : {}),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Erro ao cadastrar jogador:', error);
    return { message: 'Erro ao cadastrar jogador. Tente novamente.', values };
  }

  revalidatePath('/players');
  revalidatePath('/dashboard');
  redirect('/players');
}

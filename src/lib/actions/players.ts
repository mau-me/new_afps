'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Player from '@/lib/models/Player';
import AllowedUser from '@/lib/models/AllowedUser';
import User from '@/lib/models/User';
import { assertRole } from '@/lib/session';
import { fieldErrors, objectIdSchema, playerSchema } from '@/lib/validation';

export type PlayerFormState = {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ActionResult = { ok: boolean; message: string };

function formValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()]
      .filter(([k]) => !k.startsWith('$ACTION'))
      .map(([k, v]) => [k, String(v)])
  );
}

function isDuplicateKey(error: unknown) {
  return (error as { code?: number })?.code === 11000;
}

/**
 * Cadastra um jogador (somente comissão).
 * Também libera o CPF para o jogador criar sua conta e, se a conta já
 * existir, vincula a ficha a ela.
 */
export async function createPlayer(
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  const session = await assertRole('comissao');

  const values = formValues(formData);
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

/**
 * Atualiza a ficha de um jogador (somente comissão).
 * O CPF só pode mudar enquanto a ficha não estiver ligada a uma conta; nesse
 * caso a liberação de cadastro (AllowedUser) acompanha o novo CPF.
 */
export async function updatePlayer(
  playerId: string,
  _prev: PlayerFormState,
  formData: FormData
): Promise<PlayerFormState> {
  await assertRole('comissao');

  const id = objectIdSchema.safeParse(playerId);
  if (!id.success) return { message: 'Jogador inválido.' };

  const values = formValues(formData);
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
    const current = await Player.findById(id.data).select('cpf userId').lean();
    if (!current) return { message: 'Jogador não encontrado.', values };

    const cpfChanged = current.cpf !== data.cpf;
    if (cpfChanged && current.userId) {
      return {
        message: 'O CPF não pode mudar depois que o jogador criou a conta.',
        errors: { cpf: 'CPF bloqueado: a ficha já está ligada a uma conta' },
        values,
      };
    }
    if (cpfChanged && (await Player.exists({ cpf: data.cpf }))) {
      return {
        message: 'Já existe um jogador com este CPF.',
        errors: { cpf: 'CPF já cadastrado' },
        values,
      };
    }

    await Player.updateOne({ _id: id.data }, { $set: data }, { runValidators: true });

    if (cpfChanged) {
      // Move a liberação de cadastro (ainda não usada) para o novo CPF.
      const moved = await AllowedUser.updateOne(
        { cpf: current.cpf, isUsed: false },
        { $set: { cpf: data.cpf, name: data.fullName } }
      );
      if (moved.matchedCount === 0) {
        await AllowedUser.updateOne(
          { cpf: data.cpf },
          { $setOnInsert: { cpf: data.cpf, name: data.fullName, isUsed: false } },
          { upsert: true }
        );
      }
    }
  } catch (error) {
    if (isDuplicateKey(error)) {
      return {
        message: 'Já existe um jogador com este CPF.',
        errors: { cpf: 'CPF já cadastrado' },
        values,
      };
    }
    console.error('Erro ao atualizar jogador:', error);
    return { message: 'Erro ao salvar. Tente novamente.', values };
  }

  revalidatePath('/players');
  revalidatePath(`/players/${id.data}`);
  revalidatePath('/me');
  redirect(`/players/${id.data}`);
}

/** Ativa ou desativa um jogador. Inativos não recebem novas mensalidades. */
export async function setPlayerActive(
  playerId: string,
  isActive: boolean
): Promise<ActionResult> {
  await assertRole('comissao');

  const id = objectIdSchema.safeParse(playerId);
  if (!id.success) return { ok: false, message: 'Jogador inválido.' };

  await dbConnect();
  const player = await Player.findByIdAndUpdate(
    id.data,
    { $set: { isActive: Boolean(isActive) } },
    { new: true }
  )
    .select('nickname isActive')
    .lean();

  if (!player) return { ok: false, message: 'Jogador não encontrado.' };

  revalidatePath('/players');
  revalidatePath(`/players/${id.data}`);
  revalidatePath('/dashboard');
  revalidatePath('/financial/monthly');

  return {
    ok: true,
    message: player.isActive
      ? `${player.nickname} foi reativado.`
      : `${player.nickname} foi desativado. Mensalidades já geradas continuam valendo.`,
  };
}

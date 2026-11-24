'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Card from '@/lib/models/Card';
import Player from '@/lib/models/Player';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { assertRole } from '@/lib/session';
import { formatLocalDate, localDateToInstant } from '@/lib/months';
import {
  CARD_CATEGORY,
  cardSchema,
  fieldErrors,
  objectIdSchema,
  pastDateSchema,
} from '@/lib/validation';

/*
 * Server actions são endpoints públicos: todas começam com assertRole.
 */

export type CardFormState = {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ActionResult = { ok: boolean; message: string };

const COLOR_LABEL = { amarelo: 'amarelo', vermelho: 'vermelho' } as const;

function revalidateCards(playerId?: string) {
  revalidatePath('/financial/cards');
  revalidatePath('/financial');
  revalidatePath('/dashboard');
  revalidatePath('/me');
  if (playerId) revalidatePath(`/players/${playerId}`);
}

/** Só aceita voltar para páginas internas conhecidas. */
function safeReturnTo(value: FormDataEntryValue | null) {
  const v = typeof value === 'string' ? value : '';
  return /^\/(players\/[a-f\d]{24}|financial\/cards)$/i.test(v)
    ? v
    : '/financial/cards';
}

/** Registra um cartão (multa pendente) para um jogador. */
export async function createCard(
  _prev: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const session = await assertRole('comissao');

  const values = {
    playerId: String(formData.get('playerId') ?? ''),
    color: String(formData.get('color') ?? ''),
    amount: String(formData.get('amount') ?? ''),
    date: String(formData.get('date') ?? ''),
    description: String(formData.get('description') ?? ''),
  };
  const returnTo = safeReturnTo(formData.get('returnTo'));

  const parsed = cardSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: 'Corrija os campos destacados.',
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  try {
    await dbConnect();
    if (!(await Player.exists({ _id: parsed.data.playerId }))) {
      return { errors: { playerId: 'Jogador não encontrado' }, values };
    }
    await Card.create({
      playerId: parsed.data.playerId,
      color: parsed.data.color,
      amountCents: parsed.data.amount,
      date: localDateToInstant(parsed.data.date),
      description: parsed.data.description,
      createdBy: session.user.id,
    });
  } catch (error) {
    console.error('Erro ao registrar cartão:', error);
    return { message: 'Não foi possível registrar o cartão.', values };
  }

  revalidateCards(parsed.data.playerId);
  redirect(returnTo);
}

class ConflictError extends Error {}

/** Registra o pagamento da multa e lança a entrada no caixa (atômico). */
export async function payCard(
  cardId: string,
  paymentDate: string
): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(cardId);
  if (!id.success) return { ok: false, message: 'Cartão inválido.' };
  const date = pastDateSchema.safeParse(paymentDate);
  if (!date.success) {
    return { ok: false, message: date.error.issues[0]?.message ?? 'Data inválida.' };
  }
  const paidAt = localDateToInstant(date.data);

  await dbConnect();
  const dbSession = await mongoose.startSession();
  let playerId = '';
  let nickname = '';

  try {
    await dbSession.withTransaction(async () => {
      const card = await Card.findOneAndUpdate(
        { _id: id.data, status: 'pendente' },
        { $set: { status: 'pago', paymentDate: paidAt } },
        { new: true, session: dbSession }
      );
      if (!card) throw new ConflictError();

      const player = await Player.findById(card.playerId)
        .select('nickname')
        .session(dbSession)
        .lean();
      playerId = String(card.playerId);
      nickname = player?.nickname ?? 'jogador';

      await Transaction.create(
        [
          {
            type: 'entrada',
            category: CARD_CATEGORY,
            amountCents: card.amountCents,
            date: paidAt,
            description: `Cartão ${COLOR_LABEL[card.color]} de ${formatLocalDate(card.date)} — ${nickname}`,
            cardId: card._id,
            createdBy: session.user.id,
          },
        ],
        { session: dbSession }
      );
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return {
        ok: false,
        message: 'Esta multa já foi paga ou não existe mais. Atualize a página.',
      };
    }
    console.error('Erro ao registrar pagamento de cartão:', error);
    return { ok: false, message: 'Não foi possível registrar o pagamento.' };
  } finally {
    await dbSession.endSession();
  }

  revalidateCards(playerId);
  return { ok: true, message: `Multa de ${nickname} paga.` };
}

/** Desfaz o pagamento: volta a pendente e tira a entrada do caixa. */
export async function undoCardPayment(cardId: string): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(cardId);
  if (!id.success) return { ok: false, message: 'Cartão inválido.' };

  await dbConnect();
  const dbSession = await mongoose.startSession();
  let playerId = '';

  try {
    await dbSession.withTransaction(async () => {
      const card = await Card.findOneAndUpdate(
        { _id: id.data, status: 'pago' },
        { $set: { status: 'pendente' }, $unset: { paymentDate: 1 } },
        { new: true, session: dbSession }
      );
      if (!card) throw new ConflictError();
      playerId = String(card.playerId);

      await Transaction.updateMany(
        { cardId: card._id, ...activeFilter },
        { $set: { deletedAt: new Date(), deletedBy: session.user.id } },
        { session: dbSession }
      );
    });
  } catch (error) {
    if (error instanceof ConflictError) {
      return { ok: false, message: 'Esta multa não está paga. Atualize a página.' };
    }
    console.error('Erro ao desfazer pagamento de cartão:', error);
    return { ok: false, message: 'Não foi possível desfazer o pagamento.' };
  } finally {
    await dbSession.endSession();
  }

  revalidateCards(playerId);
  return { ok: true, message: 'Pagamento da multa desfeito.' };
}

/** Exclui um cartão registrado por engano (somente se ainda não foi pago). */
export async function deleteCard(cardId: string): Promise<ActionResult> {
  await assertRole('comissao');

  const id = objectIdSchema.safeParse(cardId);
  if (!id.success) return { ok: false, message: 'Cartão inválido.' };

  await dbConnect();
  const card = await Card.findOneAndDelete({ _id: id.data, status: 'pendente' })
    .select('playerId')
    .lean();

  if (!card) {
    return {
      ok: false,
      message: 'Só é possível excluir multas ainda não pagas. Desfaça o pagamento antes.',
    };
  }

  revalidateCards(String(card.playerId));
  return { ok: true, message: 'Cartão excluído.' };
}

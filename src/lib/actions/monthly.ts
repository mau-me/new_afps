'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Association from '@/lib/models/Association';
import Monthly from '@/lib/models/Monthly';
import Player from '@/lib/models/Player';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { assertRole } from '@/lib/session';
import {
  dueDateFor,
  formatReferenceMonth,
  localDateToInstant,
} from '@/lib/months';
import {
  MONTHLY_CATEGORY,
  fieldErrors,
  monthlySettingsSchema,
  objectIdSchema,
  paymentDateSchema,
  referenceMonthSchema,
} from '@/lib/validation';

/*
 * Server actions são endpoints públicos: todas começam com assertRole.
 */

export type ActionResult = { ok: boolean; message: string };

export type SettingsState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};


function revalidateMonthly() {
  revalidatePath('/financial/monthly');
  revalidatePath('/dashboard');
}

/** Salva o valor único da mensalidade e o dia de vencimento. */
export async function updateMonthlySettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await assertRole('comissao');

  const values = {
    fee: String(formData.get('fee') ?? ''),
    dueDay: String(formData.get('dueDay') ?? ''),
  };
  const parsed = monthlySettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  await dbConnect();
  const saved = await Association.findOneAndUpdate(
    {},
    { $set: { monthlyFeeCents: parsed.data.fee, dueDay: parsed.data.dueDay } },
    { new: true, runValidators: true }
  )
    .select('monthlyFeeCents dueDay')
    .lean();

  if (!saved) {
    return {
      message: 'Associação não encontrada. Rode `npm run seed` primeiro.',
      values,
    };
  }

  // Confere o que foi gravado de fato antes de confirmar ao usuário.
  if (
    saved.monthlyFeeCents !== parsed.data.fee ||
    saved.dueDay !== parsed.data.dueDay
  ) {
    console.error('Configuração de mensalidade não foi gravada', saved);
    return {
      message:
        'O valor não foi gravado. Reinicie o servidor e tente de novo; se continuar, avise o suporte.',
      values,
    };
  }

  revalidateMonthly();
  return {
    ok: true,
    message:
      'Valor salvo. Ele vale para as próximas mensalidades geradas; as já geradas não mudam.',
  };
}

/**
 * Gera uma mensalidade para cada jogador ativo no mês. Idempotente: quem já
 * tem mensalidade no mês não ganha outra (upsert + índice único).
 */
export async function generateMonthlies(month: string): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const parsedMonth = referenceMonthSchema.safeParse(month);
  if (!parsedMonth.success) {
    return { ok: false, message: 'Mês inválido.' };
  }

  await dbConnect();

  const association = await Association.findOne()
    .select('monthlyFeeCents dueDay')
    .lean();
  if (!association?.monthlyFeeCents) {
    return {
      ok: false,
      message: 'Defina o valor da mensalidade antes de gerar.',
    };
  }

  const players = await Player.find({ isActive: true }).select('_id').lean();
  if (players.length === 0) {
    return { ok: false, message: 'Não há jogadores ativos cadastrados.' };
  }

  const dueDate = dueDateFor(parsedMonth.data, association.dueDay);
  const result = await Monthly.bulkWrite(
    players.map((p) => ({
      updateOne: {
        filter: { playerId: p._id, referenceMonth: parsedMonth.data },
        update: {
          $setOnInsert: {
            playerId: p._id,
            referenceMonth: parsedMonth.data,
            amountCents: association.monthlyFeeCents,
            dueDate,
            status: 'em_aberto',
            createdBy: new mongoose.Types.ObjectId(session.user.id),
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  revalidateMonthly();

  const created = result.upsertedCount;
  const label = formatReferenceMonth(parsedMonth.data);
  if (created === 0) {
    return {
      ok: true,
      message: `Todos os jogadores ativos já têm mensalidade de ${label}.`,
    };
  }
  return {
    ok: true,
    message: `${created} mensalidade${created === 1 ? '' : 's'} de ${label} gerada${created === 1 ? '' : 's'}.`,
  };
}

class PaymentConflictError extends Error {}

/**
 * Registra o pagamento e lança a entrada no caixa na mesma transação:
 * ou as duas coisas acontecem, ou nenhuma.
 */
export async function registerPayment(
  monthlyId: string,
  paymentDate: string
): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(monthlyId);
  if (!id.success) return { ok: false, message: 'Mensalidade inválida.' };

  const date = paymentDateSchema.safeParse(paymentDate);
  if (!date.success) {
    return { ok: false, message: date.error.issues[0]?.message ?? 'Data inválida.' };
  }
  const paidAt = localDateToInstant(date.data);

  await dbConnect();
  const dbSession = await mongoose.startSession();

  try {
    let nickname = '';
    await dbSession.withTransaction(async () => {
      // Só paga o que está em aberto: impede pagamento em dobro.
      const monthly = await Monthly.findOneAndUpdate(
        { _id: id.data, status: 'em_aberto' },
        { $set: { status: 'pago', paymentDate: paidAt } },
        { new: true, session: dbSession }
      );
      if (!monthly) throw new PaymentConflictError();

      const player = await Player.findById(monthly.playerId)
        .select('nickname')
        .session(dbSession)
        .lean();
      nickname = player?.nickname ?? 'jogador';

      await Transaction.create(
        [
          {
            type: 'entrada',
            category: MONTHLY_CATEGORY,
            amountCents: monthly.amountCents,
            date: paidAt,
            description: `Mensalidade ${formatReferenceMonth(monthly.referenceMonth)} — ${nickname}`,
            monthlyId: monthly._id,
            createdBy: session.user.id,
          },
        ],
        { session: dbSession }
      );
    });

    revalidateMonthly();
    return { ok: true, message: `Pagamento de ${nickname} registrado.` };
  } catch (error) {
    if (error instanceof PaymentConflictError) {
      return {
        ok: false,
        message: 'Esta mensalidade já foi paga ou não existe mais. Atualize a página.',
      };
    }
    console.error('Erro ao registrar pagamento:', error);
    return { ok: false, message: 'Não foi possível registrar o pagamento.' };
  } finally {
    await dbSession.endSession();
  }
}

/**
 * Desfaz um pagamento: volta para "em aberto" e tira a entrada do caixa
 * (exclusão lógica — o lançamento fica no banco para auditoria).
 */
export async function undoPayment(monthlyId: string): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const id = objectIdSchema.safeParse(monthlyId);
  if (!id.success) return { ok: false, message: 'Mensalidade inválida.' };

  await dbConnect();
  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      const monthly = await Monthly.findOneAndUpdate(
        { _id: id.data, status: 'pago' },
        { $set: { status: 'em_aberto' }, $unset: { paymentDate: 1 } },
        { new: true, session: dbSession }
      );
      if (!monthly) throw new PaymentConflictError();

      await Transaction.updateMany(
        { monthlyId: monthly._id, ...activeFilter },
        { $set: { deletedAt: new Date(), deletedBy: session.user.id } },
        { session: dbSession }
      );
    });

    revalidateMonthly();
    return { ok: true, message: 'Pagamento desfeito.' };
  } catch (error) {
    if (error instanceof PaymentConflictError) {
      return {
        ok: false,
        message: 'Esta mensalidade não está paga. Atualize a página.',
      };
    }
    console.error('Erro ao desfazer pagamento:', error);
    return { ok: false, message: 'Não foi possível desfazer o pagamento.' };
  } finally {
    await dbSession.endSession();
  }
}

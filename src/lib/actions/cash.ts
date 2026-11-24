'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Transaction, { activeFilter } from '@/lib/models/Transaction';
import { assertRole } from '@/lib/session';
import { localDateToInstant } from '@/lib/months';
import {
  fieldErrors,
  objectIdSchema,
  transactionSchema,
} from '@/lib/validation';

/*
 * Server actions são endpoints públicos: todas começam com assertRole.
 */

export type TransactionFormState = {
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ActionResult = { ok: boolean; message: string };

function revalidateCash() {
  revalidatePath('/financial');
  revalidatePath('/financial/monthly');
  revalidatePath('/dashboard');
}

/** Lançamento manual de entrada ou saída no caixa. */
export async function createTransaction(
  _prev: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await assertRole('comissao');

  const values = {
    type: String(formData.get('type') ?? ''),
    category: String(formData.get('category') ?? ''),
    amount: String(formData.get('amount') ?? ''),
    date: String(formData.get('date') ?? ''),
    description: String(formData.get('description') ?? ''),
  };

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: 'Corrija os campos destacados.',
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  try {
    await dbConnect();
    await Transaction.create({
      type: parsed.data.type,
      category: parsed.data.category,
      amountCents: parsed.data.amount,
      date: localDateToInstant(parsed.data.date),
      description: parsed.data.description,
      createdBy: session.user.id,
    });
  } catch (error) {
    console.error('Erro ao criar lançamento:', error);
    return { message: 'Não foi possível salvar o lançamento.', values };
  }

  revalidateCash();
  redirect(`/financial?month=${parsed.data.date.slice(0, 7)}`);
}

/**
 * Exclui um lançamento manual (exclusão lógica). Entradas geradas por
 * mensalidade só podem ser desfeitas na página de Mensalidades.
 */
export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = await assertRole('comissao');

  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, message: 'Lançamento inválido.' };

  await dbConnect();
  const transaction = await Transaction.findOne({
    _id: parsedId.data,
    ...activeFilter,
  })
    .select('monthlyId')
    .lean();

  if (!transaction) {
    return {
      ok: false,
      message: 'Este lançamento não existe mais. Atualize a página.',
    };
  }
  if (transaction.monthlyId) {
    return {
      ok: false,
      message:
        'Este lançamento veio de uma mensalidade. Desfaça o pagamento na página de Mensalidades.',
    };
  }

  // Condição repetida no update: protege contra exclusões simultâneas.
  const result = await Transaction.updateOne(
    { _id: parsedId.data, monthlyId: { $exists: false }, ...activeFilter },
    { $set: { deletedAt: new Date(), deletedBy: session.user.id } }
  );
  if (result.modifiedCount === 0) {
    return {
      ok: false,
      message: 'Este lançamento não existe mais. Atualize a página.',
    };
  }

  revalidateCash();
  return { ok: true, message: 'Lançamento excluído.' };
}

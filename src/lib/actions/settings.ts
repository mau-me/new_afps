'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import AllowedUser from '@/lib/models/AllowedUser';
import Association from '@/lib/models/Association';
import { assertRole } from '@/lib/session';
import {
  allowCpfSchema,
  associationSchema,
  feesSchema,
  fieldErrors,
  objectIdSchema,
} from '@/lib/validation';

/*
 * Server actions são endpoints públicos: todas começam com assertRole.
 */

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ActionResult = { ok: boolean; message: string };

function valuesOf(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? '')]));
}

const ASSOCIATION_KEYS = [
  'name',
  'description',
  'address',
  'phone',
  'email',
  'gameSchedule',
  'commission',
  'facebook',
  'twitter',
  'instagram',
];

/** Dados públicos da associação (aparecem na página inicial). */
export async function updateAssociation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await assertRole('comissao');

  const values = valuesOf(formData, ASSOCIATION_KEYS);
  const parsed = associationSchema.safeParse(values);
  if (!parsed.success) {
    return {
      message: 'Corrija os campos destacados.',
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  const { facebook, twitter, instagram, ...rest } = parsed.data;
  await dbConnect();
  const result = await Association.updateOne(
    {},
    { $set: { ...rest, socialMedia: { facebook, twitter, instagram } } },
    { runValidators: true }
  );
  if (result.matchedCount === 0) {
    return { message: 'Associação não encontrada. Rode `npm run seed`.', values };
  }

  revalidatePath('/');
  revalidatePath('/settings');
  return { ok: true, message: 'Dados da associação salvos.', values };
}

/** Valores: mensalidade, vencimento e multas padrão. */
export async function updateFees(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await assertRole('comissao');

  const values = valuesOf(formData, ['monthlyFee', 'dueDay', 'yellowCardFee', 'redCardFee']);
  const parsed = feesSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  await dbConnect();
  const update = {
    monthlyFeeCents: parsed.data.monthlyFee,
    dueDay: parsed.data.dueDay,
    yellowCardFeeCents: parsed.data.yellowCardFee,
    redCardFeeCents: parsed.data.redCardFee,
  };
  const saved = await Association.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, runValidators: true }
  )
    .select(Object.keys(update).join(' '))
    .lean();

  if (!saved) {
    return { message: 'Associação não encontrada. Rode `npm run seed`.', values };
  }
  // Confere o que foi gravado antes de confirmar (ver defineModel).
  const mismatch = (Object.keys(update) as (keyof typeof update)[]).some(
    (k) => saved[k] !== update[k]
  );
  if (mismatch) {
    return {
      message: 'Os valores não foram gravados. Reinicie o servidor e tente de novo.',
      values,
    };
  }

  revalidatePath('/settings');
  revalidatePath('/financial/monthly');
  revalidatePath('/financial/cards/new');
  return {
    ok: true,
    message: 'Valores salvos. Mensalidades e multas já registradas não mudam.',
    values,
  };
}

/** Libera um CPF para criar conta sem ficha de jogador (ex.: comissão). */
export async function allowCpf(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await assertRole('comissao');

  const values = valuesOf(formData, ['name', 'cpf']);
  const parsed = allowCpfSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values };
  }

  await dbConnect();
  if (await AllowedUser.exists({ cpf: parsed.data.cpf })) {
    return { errors: { cpf: 'Este CPF já está na lista' }, values };
  }
  await AllowedUser.create({ ...parsed.data, isUsed: false });

  revalidatePath('/settings/allowed');
  return { ok: true, message: `CPF de ${parsed.data.name} liberado.` };
}

/** Remove uma liberação ainda não usada. */
export async function revokeCpf(id: string): Promise<ActionResult> {
  await assertRole('comissao');

  const parsed = objectIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, message: 'Registro inválido.' };

  await dbConnect();
  const removed = await AllowedUser.findOneAndDelete({ _id: parsed.data, isUsed: false });
  if (!removed) {
    return {
      ok: false,
      message: 'Este CPF já foi usado para criar uma conta e não pode ser removido.',
    };
  }

  revalidatePath('/settings/allowed');
  return { ok: true, message: 'Liberação removida.' };
}

/**
 * Schemas de validação compartilhados entre cliente e servidor.
 * Não importe nada de mongoose aqui (este arquivo vai para o bundle do cliente).
 */
import { z } from 'zod';
import { onlyDigits, parseCurrencyToCents, validateCPF } from './utils';
import { isReferenceMonth, todayISO } from './months';

export const PASSWORD_MIN_LENGTH = 8;

export const PLAYER_POSITIONS = [
  'Goleiro',
  'Zagueiro',
  'Lateral',
  'Volante',
  'Meia',
  'Atacante',
] as const;

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine(validateCPF, 'CPF inválido');

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo').max(120),
  email: z.string().trim().toLowerCase().pipe(z.email('Email inválido')),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`
    )
    .max(128),
  cpf: cpfSchema,
});

export type RegisterInput = z.input<typeof registerSchema>;

export const playerSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe o nome completo').max(120),
  nickname: z.string().trim().min(1, 'Informe o apelido').max(40),
  cpf: cpfSchema,
  position: z.enum(PLAYER_POSITIONS, 'Selecione uma posição válida'),
  shirtNumber: z.coerce
    .number('Número da camisa inválido')
    .int('Número da camisa inválido')
    .min(1, 'Número entre 1 e 99')
    .max(99, 'Número entre 1 e 99'),
  birthDate: z.coerce
    .date('Data de nascimento inválida')
    .refine((d) => d <= new Date(), 'Data de nascimento no futuro'),
  phone: z
    .string()
    .transform(onlyDigits)
    .refine((v) => v.length === 10 || v.length === 11, 'Telefone inválido'),
  address: z.string().trim().min(5, 'Informe o endereço').max(200),
});

export type PlayerInput = z.input<typeof playerSchema>;

export const referenceMonthSchema = z
  .string()
  .refine(isReferenceMonth, 'Mês de referência inválido');

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Identificador inválido');

export const monthlySettingsSchema = z.object({
  fee: z
    .string()
    .transform((v, ctx) => {
      const cents = parseCurrencyToCents(v.replace(/^R\$\s*/i, ''));
      if (cents === null || cents <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um valor maior que zero, como 30 ou 30,00',
        });
        return z.NEVER;
      }
      return cents;
    }),
  dueDay: z.coerce
    .number('Informe o dia do vencimento')
    .int('Informe um dia entre 1 e 28')
    .min(1, 'Informe um dia entre 1 e 28')
    .max(28, 'Informe um dia entre 1 e 28'),
});

/** Data local (YYYY-MM-DD), existente e não futura. */
export const pastDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
  .refine((d) => {
    // Rejeita datas inexistentes como 2026-02-30
    const parsed = new Date(`${d}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === d
    );
  }, 'Data inválida')
  .refine((d) => d <= todayISO(), 'A data não pode ser no futuro');

/** Data do pagamento de uma mensalidade. */
export const paymentDateSchema = pastDateSchema;

/** Categoria reservada para entradas geradas pelas mensalidades. */
export const MONTHLY_CATEGORY = 'Mensalidade';

export const TRANSACTION_CATEGORIES = {
  entrada: [MONTHLY_CATEGORY, 'Multa', 'Doação', 'Patrocínio', 'Evento', 'Outros'],
  saida: [
    'Arbitragem',
    'Material esportivo',
    'Aluguel de campo',
    'Confraternização',
    'Manutenção',
    'Outros',
  ],
} as const;

/** Categorias disponíveis para lançamento manual (sem "Mensalidade"). */
export function manualCategories(type: 'entrada' | 'saida'): readonly string[] {
  return TRANSACTION_CATEGORIES[type].filter((c) => c !== MONTHLY_CATEGORY);
}

export const transactionSchema = z
  .object({
    type: z.enum(['entrada', 'saida'], 'Escolha entrada ou saída'),
    category: z.string().min(1, 'Escolha uma categoria'),
    amount: z.string().transform((v, ctx) => {
      const cents = parseCurrencyToCents(v.replace(/^R\$\s*/i, ''));
      if (cents === null || cents <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um valor maior que zero, como 50 ou 50,00',
        });
        return z.NEVER;
      }
      return cents;
    }),
    date: pastDateSchema,
    description: z
      .string()
      .trim()
      .min(3, 'Descreva o lançamento em poucas palavras')
      .max(140, 'Use no máximo 140 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (!manualCategories(data.type).includes(data.category)) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message:
          data.category === MONTHLY_CATEGORY
            ? 'Mensalidades são lançadas pela página de Mensalidades'
            : 'Escolha uma categoria da lista',
      });
    }
  });

/** Categoria das entradas geradas pelo pagamento de cartões. */
export const CARD_CATEGORY = 'Multa';

const centsField = (message: string) =>
  z.string().transform((v, ctx) => {
    const cents = parseCurrencyToCents(v.replace(/^R\$\s*/i, ''));
    if (cents === null || cents <= 0) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    return cents;
  });

export const cardSchema = z.object({
  playerId: z.string().min(1, 'Escolha o jogador').pipe(objectIdSchema),
  color: z.enum(['amarelo', 'vermelho'], 'Escolha a cor do cartão'),
  amount: centsField('Informe o valor da multa, como 10 ou 10,00'),
  date: pastDateSchema,
  description: z.string().trim().max(140, 'Use no máximo 140 caracteres'),
});

/** Converte erros do zod em { campo: mensagem } (primeira mensagem por campo). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    result[key] ??= issue.message;
  }
  return result;
}

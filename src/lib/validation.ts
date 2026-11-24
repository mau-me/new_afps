/**
 * Schemas de validação compartilhados entre cliente e servidor.
 * Não importe nada de mongoose aqui (este arquivo vai para o bundle do cliente).
 */
import { z } from 'zod';
import { onlyDigits, validateCPF } from './utils';

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

/** Converte erros do zod em { campo: mensagem } (primeira mensagem por campo). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    result[key] ??= issue.message;
  }
  return result;
}

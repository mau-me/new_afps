import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCPF(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (111.111.111-11 etc.)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = 11 - (sum % 11);
    return remainder >= 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

/** Máscara progressiva de CPF (000.000.000-00), útil enquanto o usuário digita. */
export function formatCPF(value: string): string {
  const cpf = onlyDigits(value).slice(0, 11);
  return cpf
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function formatPhone(value: string): string {
  const phone = onlyDigits(value);
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um valor em centavos (inteiro) como moeda brasileira. */
export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/**
 * Converte um valor digitado ("1.234,56", "10,5", "10") para centavos.
 * Retorna `null` se o valor for inválido.
 */
export function parseCurrencyToCents(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(dateObj);
}

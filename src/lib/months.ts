/**
 * Utilitários de mês de referência (YYYY-MM) e datas no fuso da associação.
 * Funções puras: podem rodar no cliente e no servidor.
 *
 * A associação fica na Bahia (UTC-3, sem horário de verão), então usamos um
 * deslocamento fixo para não depender do fuso do servidor.
 */
export const APP_TIMEZONE = 'America/Bahia';
const UTC_OFFSET_HOURS = 3; // Bahia = UTC-3

const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isReferenceMonth(value: unknown): value is string {
  return typeof value === 'string' && MONTH_RE.test(value);
}

/** Data de hoje no fuso da associação, como YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  // en-CA formata como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(
    now
  );
}

/** Mês atual no fuso da associação (YYYY-MM). */
export function currentReferenceMonth(now = new Date()): string {
  return todayISO(now).slice(0, 7);
}

/** Lê `?month=`; se ausente ou inválido, usa o mês atual. */
export function parseMonthParam(value: unknown, now = new Date()): string {
  return isReferenceMonth(value) ? value : currentReferenceMonth(now);
}

/** Soma (ou subtrai) meses: shiftMonth('2026-01', -1) === '2025-12'. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** "novembro de 2026" */
export function formatReferenceMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 15)));
}

/** "nov/2026" — versão curta para botões. */
export function formatReferenceMonthShort(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const name = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(new Date(Date.UTC(y, m - 1, 15)))
    .replace('.', '');
  return `${name}/${y}`;
}

/**
 * Vencimento: último instante do dia `dueDay` no fuso da associação.
 * Assim a mensalidade só fica "vencida" a partir do dia seguinte.
 */
export function dueDateFor(month: string, dueDay: number): Date {
  const [y, m] = month.split('-').map(Number);
  // 00:00 do dia seguinte em UTC-3 = 03:00Z; menos 1 ms = 23:59:59.999 local
  return new Date(Date.UTC(y, m - 1, dueDay + 1, UTC_OFFSET_HOURS) - 1);
}

/** Converte YYYY-MM-DD (data local da associação) para meio-dia local. */
export function localDateToInstant(date: string): Date {
  const match = DATE_RE.exec(date);
  if (!match) throw new Error(`Data inválida: ${date}`);
  const [, y, m, d] = match.map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12 + UTC_OFFSET_HOURS));
}

/** Formata um instante como data no fuso da associação (dd/mm/aaaa). */
export function formatLocalDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: APP_TIMEZONE }).format(
    typeof date === 'string' ? new Date(date) : date
  );
}

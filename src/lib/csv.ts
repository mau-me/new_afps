/**
 * Gera CSV no formato que o Excel em português abre direto: separador ";",
 * vírgula decimal e BOM UTF-8 (para acentos aparecerem certos).
 */
const BOM = '﻿';

function escapeCell(value: string | number): string {
  const text = String(value);
  // Evita que o Excel interprete o conteúdo como fórmula (CSV injection).
  const safe = /^[=+\-@\t\r]/.test(text) && typeof value !== 'number' ? `'${text}` : text;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(';'));
  return BOM + lines.join('\r\n') + '\r\n';
}

/** 123456 → "1234,56" (sem símbolo, para planilhas somarem). */
export function centsToCsv(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}

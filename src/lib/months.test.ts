import { describe, expect, it } from 'vitest';
import {
  currentReferenceMonth,
  dueDateFor,
  formatLocalDate,
  formatReferenceMonth,
  formatReferenceMonthShort,
  isReferenceMonth,
  localDateToInstant,
  monthRange,
  parseMonthParam,
  referenceMonthOf,
  shiftMonth,
  todayISO,
} from './months';

describe('mês de referência', () => {
  it('valida o formato YYYY-MM', () => {
    expect(isReferenceMonth('2026-11')).toBe(true);
    expect(isReferenceMonth('2026-13')).toBe(false);
    expect(isReferenceMonth('2026-1')).toBe(false);
    expect(isReferenceMonth(undefined)).toBe(false);
  });

  it('avança e volta meses atravessando o ano', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-05', 0)).toBe('2026-05');
  });

  it('usa o mês atual quando o parâmetro é inválido', () => {
    const now = new Date('2026-11-24T15:00:00Z');
    expect(parseMonthParam('2026-03', now)).toBe('2026-03');
    expect(parseMonthParam('abc', now)).toBe('2026-11');
    expect(parseMonthParam(undefined, now)).toBe('2026-11');
  });

  it('considera o fuso da Bahia na virada do mês', () => {
    // 01/12 às 01:00 UTC ainda é 30/11 às 22:00 na Bahia
    const now = new Date('2026-12-01T01:00:00Z');
    expect(currentReferenceMonth(now)).toBe('2026-11');
    expect(todayISO(now)).toBe('2026-11-30');
  });

  it('formata o mês por extenso e abreviado', () => {
    expect(formatReferenceMonth('2026-11')).toBe('novembro de 2026');
    expect(formatReferenceMonthShort('2026-03')).toBe('mar/2026');
  });
});

describe('vencimento', () => {
  it('vence no último instante do dia, no horário da Bahia', () => {
    const due = dueDateFor('2026-11', 10);
    expect(due.toISOString()).toBe('2026-11-11T02:59:59.999Z');
    expect(formatLocalDate(due)).toBe('10/11/2026');
  });

  it('funciona em fevereiro e na virada do ano', () => {
    expect(formatLocalDate(dueDateFor('2026-02', 28))).toBe('28/02/2026');
    expect(formatLocalDate(dueDateFor('2026-12', 28))).toBe('28/12/2026');
  });

  it('só fica vencida a partir do dia seguinte', () => {
    const due = dueDateFor('2026-11', 10);
    // 10/11 às 23:00 na Bahia = 11/11 02:00 UTC → ainda no prazo
    expect(new Date('2026-11-11T02:00:00Z') < due).toBe(true);
    // 11/11 às 00:30 na Bahia → vencida
    expect(new Date('2026-11-11T03:30:00Z') > due).toBe(true);
  });
});

describe('data do pagamento', () => {
  it('guarda a data local ao meio-dia e exibe o mesmo dia', () => {
    const instant = localDateToInstant('2026-11-05');
    expect(instant.toISOString()).toBe('2026-11-05T15:00:00.000Z');
    expect(formatLocalDate(instant)).toBe('05/11/2026');
  });

  it('rejeita formato inválido', () => {
    expect(() => localDateToInstant('05/11/2026')).toThrow();
  });
});

describe('monthRange', () => {
  it('vai de 00:00 do dia 1 até 00:00 do mês seguinte, no horário da Bahia', () => {
    const { start, end } = monthRange('2026-11');
    expect(start.toISOString()).toBe('2026-11-01T03:00:00.000Z');
    expect(end.toISOString()).toBe('2026-12-01T03:00:00.000Z');
  });

  it('atravessa a virada do ano', () => {
    const { start, end } = monthRange('2026-12');
    expect(start.toISOString()).toBe('2026-12-01T03:00:00.000Z');
    expect(end.toISOString()).toBe('2027-01-01T03:00:00.000Z');
  });

  it('um lançamento do dia 30 à noite pertence ao próprio mês', () => {
    // 30/11 às 23:30 na Bahia = 01/12 02:30 UTC
    const late = new Date('2026-12-01T02:30:00Z');
    const { start, end } = monthRange('2026-11');
    expect(late >= start && late < end).toBe(true);
    expect(referenceMonthOf(late)).toBe('2026-11');
  });

  it('a data de um lançamento (meio-dia local) cai no mês certo', () => {
    const { start, end } = monthRange('2026-11');
    const first = localDateToInstant('2026-11-01');
    const last = localDateToInstant('2026-11-30');
    expect(first >= start && last < end).toBe(true);
  });
});

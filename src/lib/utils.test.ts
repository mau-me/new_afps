import { describe, expect, it } from 'vitest';
import {
  formatCPF,
  formatCents,
  formatPhone,
  onlyDigits,
  parseCurrencyToCents,
  validateCPF,
} from './utils';

describe('validateCPF', () => {
  it('aceita CPFs válidos, com ou sem máscara', () => {
    expect(validateCPF('12345678909')).toBe(true);
    expect(validateCPF('123.456.789-09')).toBe(true);
    expect(validateCPF('98765432100')).toBe(true);
  });

  it('rejeita dígitos verificadores errados', () => {
    expect(validateCPF('12345678901')).toBe(false);
    expect(validateCPF('11122233344')).toBe(false);
  });

  it('rejeita sequências repetidas e tamanhos errados', () => {
    expect(validateCPF('11111111111')).toBe(false);
    expect(validateCPF('1234567890')).toBe(false);
    expect(validateCPF('')).toBe(false);
  });
});

describe('formatCPF', () => {
  it('aplica a máscara progressivamente', () => {
    expect(formatCPF('123')).toBe('123');
    expect(formatCPF('1234')).toBe('123.4');
    expect(formatCPF('1234567')).toBe('123.456.7');
    expect(formatCPF('1234567890')).toBe('123.456.789-0');
    expect(formatCPF('12345678909')).toBe('123.456.789-09');
  });

  it('ignora caracteres extras e limita a 11 dígitos', () => {
    expect(formatCPF('123.456.789-0912')).toBe('123.456.789-09');
  });
});

describe('onlyDigits / formatPhone', () => {
  it('remove não dígitos', () => {
    expect(onlyDigits('(71) 9.9999-0000')).toBe('7199999' + '0000');
  });

  it('formata celular e fixo', () => {
    expect(formatPhone('71999990000')).toBe('(71) 99999-0000');
    expect(formatPhone('7133330000')).toBe('(71) 3333-0000');
  });
});

describe('moeda em centavos', () => {
  it('converte texto para centavos', () => {
    expect(parseCurrencyToCents('10')).toBe(1000);
    expect(parseCurrencyToCents('10,5')).toBe(1050);
    expect(parseCurrencyToCents('1.234,56')).toBe(123456);
    expect(parseCurrencyToCents('0,1')).toBe(10);
  });

  it('rejeita valores inválidos', () => {
    expect(parseCurrencyToCents('abc')).toBeNull();
    expect(parseCurrencyToCents('-5')).toBeNull();
    expect(parseCurrencyToCents('1,234')).toBeNull();
  });

  it('formata centavos em BRL', () => {
    expect(formatCents(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
  });
});

import { describe, expect, it } from 'vitest';
import {
  fieldErrors,
  monthlySettingsSchema,
  objectIdSchema,
  paymentDateSchema,
  playerSchema,
  referenceMonthSchema,
  registerSchema,
} from './validation';

describe('registerSchema', () => {
  const valid = {
    name: 'João Silva',
    email: '  Joao@Example.COM ',
    password: 'senhaforte',
    cpf: '123.456.789-09',
  };

  it('normaliza email e CPF', () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe('joao@example.com');
    expect(result.cpf).toBe('12345678909');
  });

  it('rejeita CPF inválido e senha curta', () => {
    const result = registerSchema.safeParse({
      ...valid,
      cpf: '123.456.789-01',
      password: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.cpf).toBe('CPF inválido');
      expect(errors.password).toMatch(/pelo menos 8/);
    }
  });
});

describe('playerSchema', () => {
  const valid = {
    fullName: 'Carlos Ferreira',
    nickname: 'Carlão',
    cpf: '555.666.777-20',
    position: 'Meia',
    shirtNumber: '10',
    birthDate: '1990-05-20',
    phone: '(71) 99999-0000',
    address: 'Rua Alto do Verão, 10',
  };

  it('converte os tipos vindos do formulário', () => {
    const result = playerSchema.parse(valid);
    expect(result.shirtNumber).toBe(10);
    expect(result.birthDate).toBeInstanceOf(Date);
    expect(result.phone).toBe('71999990000');
    expect(result.cpf).toBe('55566677720');
  });

  it('rejeita posição e número inválidos', () => {
    const result = playerSchema.safeParse({
      ...valid,
      position: 'Técnico',
      shirtNumber: '100',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.position).toBeDefined();
      expect(errors.shirtNumber).toBeDefined();
    }
  });
});

describe('monthlySettingsSchema', () => {
  it('converte o valor para centavos', () => {
    expect(monthlySettingsSchema.parse({ fee: '30', dueDay: '10' })).toEqual({
      fee: 3000,
      dueDay: 10,
    });
    expect(monthlySettingsSchema.parse({ fee: 'R$ 1.250,50', dueDay: '5' }).fee).toBe(
      125050
    );
  });

  it('rejeita valor zero, inválido e dia fora de 1 a 28', () => {
    const result = monthlySettingsSchema.safeParse({ fee: '0', dueDay: '31' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.fee).toBeDefined();
      expect(errors.dueDay).toBeDefined();
    }
    expect(monthlySettingsSchema.safeParse({ fee: 'trinta', dueDay: '10' }).success).toBe(
      false
    );
  });
});

describe('paymentDateSchema / referenceMonthSchema / objectIdSchema', () => {
  it('aceita datas válidas no passado', () => {
    expect(paymentDateSchema.safeParse('2026-01-15').success).toBe(true);
  });

  it('rejeita datas inexistentes, futuras e mal formatadas', () => {
    expect(paymentDateSchema.safeParse('2026-02-30').success).toBe(false);
    expect(paymentDateSchema.safeParse('2999-01-01').success).toBe(false);
    expect(paymentDateSchema.safeParse('15/01/2026').success).toBe(false);
  });

  it('valida mês e id', () => {
    expect(referenceMonthSchema.safeParse('2026-11').success).toBe(true);
    expect(referenceMonthSchema.safeParse('2026-00').success).toBe(false);
    expect(objectIdSchema.safeParse('a'.repeat(24)).success).toBe(true);
    expect(objectIdSchema.safeParse('123').success).toBe(false);
  });
});

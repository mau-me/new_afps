import { describe, expect, it } from 'vitest';
import { fieldErrors, playerSchema, registerSchema } from './validation';

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

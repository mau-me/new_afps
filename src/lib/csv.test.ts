import { describe, expect, it } from 'vitest';
import { centsToCsv, toCsv } from './csv';

describe('toCsv', () => {
  it('usa ponto e vírgula, BOM e quebra de linha do Windows', () => {
    const csv = toCsv(['Data', 'Valor'], [['05/11/2026', '30,00']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toBe('﻿Data;Valor\r\n05/11/2026;30,00\r\n');
  });

  it('protege células com separador, aspas e quebra de linha', () => {
    const csv = toCsv(['Descrição'], [['Bola; rede e "apito"\nnovos']]);
    expect(csv).toContain('"Bola; rede e ""apito""\nnovos"');
  });

  it('neutraliza conteúdo que o Excel executaria como fórmula', () => {
    const csv = toCsv(['Descrição'], [['=HYPERLINK("http://x")'], ['@SUM(A1)']]);
    expect(csv).toContain(`'=HYPERLINK`);
    expect(csv).toContain(`'@SUM(A1)`);
  });

  it('não altera números negativos', () => {
    expect(toCsv(['n'], [[-5]])).toContain('\r\n-5\r\n');
  });
});

describe('centsToCsv', () => {
  it('formata com vírgula decimal e sinal', () => {
    expect(centsToCsv(123456)).toBe('1234,56');
    expect(centsToCsv(5)).toBe('0,05');
    expect(centsToCsv(-1050)).toBe('-10,50');
    expect(centsToCsv(0)).toBe('0,00');
  });
});

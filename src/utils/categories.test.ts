import { describe, expect, it } from 'vitest';
import { normalizeCategoryName, slugifyCategoryKey } from './categories';

describe('categories utils', () => {
  it('normaliza nome (acentos, espaços, caixa)', () => {
    expect(normalizeCategoryName('  Alimentação   ')).toBe('alimentacao');
    expect(normalizeCategoryName('Educação')).toBe('educacao');
    expect(normalizeCategoryName('Vestuário')).toBe('vestuario');
    expect(normalizeCategoryName('Conta   de   Luz')).toBe('conta de luz');
  });

  it('gera slug/key estável com underscore', () => {
    expect(slugifyCategoryKey('Alimentação')).toBe('alimentacao');
    expect(slugifyCategoryKey('Conta de Luz')).toBe('conta_de_luz');
    expect(slugifyCategoryKey('  Pets & Veterinário  ')).toBe('pets_veterinario');
  });
});

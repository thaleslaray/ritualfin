export function normalizeCategoryName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos/diacríticos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Gera uma key/slug estável (imutável) a partir do display_name.
 *
 * Regras:
 * - remove acentos
 * - lower-case
 * - troca sequências não-alfanuméricas por `_`
 * - colapsa e remove `_` das pontas
 */
export function slugifyCategoryKey(displayName: string): string {
  const base = normalizeCategoryName(displayName)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!base) {
    throw new Error('Nome inválido para gerar key de categoria');
  }

  return base;
}

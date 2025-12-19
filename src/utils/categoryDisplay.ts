import type { Category } from '@/hooks/useCategories';

/**
 * Resolve um nome exibível para uma category key.
 *
 * - Se encontrar a categoria, retorna o display_name atual (mesmo se inativa)
 * - Se não encontrar, usa fallback:
 *   - se vier algo "legado" (nome antigo), retorna como está
 *   - se vier uma key, retorna a key (melhor do que vazio)
 */
export function getCategoryDisplayName(
  categoryKeyOrLegacy: string | null | undefined,
  categories: Category[] | undefined,
): string {
  if (!categoryKeyOrLegacy) return '';

  const found = categories?.find((c) => c.key === categoryKeyOrLegacy);
  if (found) return found.display_name;

  return categoryKeyOrLegacy;
}

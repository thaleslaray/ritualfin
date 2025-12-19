# Research — Gerenciamento de Categorias

**Feature**: `002-add-categories`  
**Date**: 2025-12-18

Este documento consolida decisões técnicas para implementar gerenciamento de categorias com
compatibilidade retroativa e baixo risco (especialmente para orçamento, transações e relatórios).

## Decision 1: Identificador canônico por categoria = `key/slug` estável (imutável)

- **Decision**: Cada categoria terá uma `key` (slug) **auto-gerada** na criação e **imutável**.
  O nome exibido (`display_name`) é mutável e pode ser renomeado livremente.
- **Rationale**: Permite renomear sem reescrever histórico (transações/orçamentos/relatórios)
  e reduz risco de inconsistência.
- **Alternatives considered**:
  - UUID como referência (robusto, porém migração maior e mais intrusiva no schema e UI).
  - Usar o próprio nome como referência (renomear exige atualização em cascata e é propenso a bugs).

## Decision 2: Reordenação manual via drag & drop (persistir `sort_order`)

- **Decision**: A ordem será **manual (drag & drop)** e persistida com `sort_order`.
- **Rationale**: Usuários conseguem adaptar o app ao seu “modelo mental”; melhora uso recorrente.
- **Alternatives considered**:
  - Ordem alfabética (simples, mas não reflete preferências reais).
  - Ordem por uso (pode surpreender e gerar instabilidade visual).

## Decision 3: Unicidade de nomes por casal via normalização

- **Decision**: Garantir unicidade do `display_name` por casal por meio de um campo
  `display_name_normalized` (case-insensitive e colapsando espaços). O `key/slug` também é único
  por casal.
- **Rationale**: Evita categorias duplicadas “na prática” (ex.: “Moradia” vs “  moradia ”).
- **Alternatives considered**:
  - Validar somente no frontend (insuficiente com concorrência e múltiplos clientes).

## Decision 4: Exclusão definitiva somente quando não houver uso

- **Decision**: Permitir exclusão definitiva **apenas** se a categoria não estiver presente em
  `category_budgets` nem `transactions`. Caso contrário, o usuário deve desativar.
- **Rationale**: Preserva histórico e relatórios, evitando perda de dados.
- **Alternatives considered**:
  - Nunca excluir (acumula lixo ao longo do tempo).
  - Excluir sempre com “remap” obrigatório (complexo e arriscado para MVP).

## Decision 5: Migração retrocompatível — converter valores antigos para keys

- **Decision**: Introduzir `categories` (por casal) e migrar valores existentes de:
  - `category_budgets.category`: de nome antigo → `key`
  - `transactions.category`: de nome antigo → `key`
  - `merchant_mappings.category`: alinhar para `key` quando possível

  Manter os nomes de coluna existentes (por enquanto) e mudar apenas o **conteúdo** (string).
- **Rationale**: Menor impacto no código existente e migração mais segura.
- **Alternatives considered**:
  - Renomear colunas / introduzir FK (maior esforço; pode ser etapa futura).

## Decision 6: Reutilizar o stack atual do frontend

- **Decision**: Reutilizar `framer-motion` para drag & drop (ex.: componentes de reorder)
  e `@tanstack/react-query` para cache e invalidações.
- **Rationale**: Evita dependências novas e mantém consistência com o app.
- **Alternatives considered**:
  - `@dnd-kit/*` (poderoso, mas aumenta superfície e trabalho no MVP).

## Decision 7: Estratégia de testes (proporcional ao risco)

- **Decision**: Adotar testes unitários focados em:
  - normalização/geração de slug
  - regras de validação (duplicidade)
  - comportamento de migração (mapeamento de nomes antigos → keys)

  Framework sugerido: Vitest + React Testing Library (introduzido no momento da implementação).
- **Rationale**: Categorias afetam orçamento/transações/relatório (área crítica); testes reduzem
  regressões.
- **Alternatives considered**:
  - Sem testes (alto risco para feature de domínio financeiro).

# Implementation Plan: Gerenciamento de Categorias

**Branch**: `002-add-categories` | **Date**: 2025-12-18 | **Spec**: `/specs/002-add-categories/spec.md`
**Input**: Feature specification from `/specs/002-add-categories/spec.md`

## Summary

Implementar gerenciamento de categorias **por casal** com:

- Identificador canônico estável `key/slug` (string) e **imutável**
- `display_name` mutável (renomeável)
- Ativar/desativar, reordenar (drag & drop com `sort_order`), criar e excluir (somente se não usada)
- Integração com orçamento (`category_budgets`) e transações (`transactions`) usando `key`
- Migração retrocompatível dos valores legados (strings com nomes antigos) para as novas keys

Abordagem técnica:

- Criar tabela `categories` (Postgres/Supabase) com RLS por `couple_id`
- Popular categorias padrão existentes para cada casal
- Migrar conteúdo de `category_budgets.category` e `transactions.category` para armazenar `categories.key`
- Substituir lista hardcoded de categorias no frontend por dados da tabela

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Vite + React)  
**Primary Dependencies**: React 18, react-router-dom, @tanstack/react-query, Supabase JS, Tailwind, shadcn/ui, framer-motion  
**Storage**: Supabase Postgres (RLS) + Supabase Storage (`uploads`)  
**Testing**: (a introduzir na implementação) Vitest + React Testing Library para regras/fluxos críticos de categorias  
**Target Platform**: Web (SPA) — desktop e mobile  
**Project Type**: Web application (frontend único em `src/` + backend gerenciado via Supabase)  
**Performance Goals**: Interações de categorias (listar/criar/renomear/reordenar) devem ser instantâneas na UI e consistentes após refresh  
**Constraints**: Sem uso de service role no cliente; tudo segregado por `couple_id` via RLS; migração sem perda de histórico  
**Scale/Scope**: Feature isolada (categorias), tocando UI + hooks + migrations/Postgres

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derivados de `.specify/memory/constitution.md`:

1) **RLS e fronteira `couple_id`**
  - Pass criteria: tabela `categories` tem RLS habilitado e policies equivalentes às demais tabelas do domínio.
2) **Banco como fonte de verdade (migrations)**
  - Pass criteria: schema + triggers/policies/seed/migração legada via migration em `supabase/migrations/`.
3) **Tipagem e validação nas bordas (TS + Zod)**
  - Pass criteria: validações de formulário/inputs (nome) e erros acionáveis; tipos via `src/integrations/supabase/types.ts`.
4) **UX calma e previsível**
  - Pass criteria: estados de loading/erro claros; categorias inativas não aparecem para novas seleções, mas histórico permanece legível.
5) **Mudança segura (lint + testes proporcionais)**
  - Pass criteria: `bun run lint` passa; adicionar testes mínimos para geração/normalização de slug e regras de duplicidade/migração.

### Re-check (post-design)

Status: **PASS (para fase de planejamento)**.

Observação: a validação final destes gates ocorrerá na implementação, quando existirem:

- migration(s) criando `categories` + RLS
- migração legada de strings → keys
- hook/UI consumindo `categories`
- pelo menos testes mínimos (proporcionais ao risco) e lint passando

## Project Structure

### Documentation (this feature)

```text
specs/002-add-categories/
├── spec.md                   # Feature spec
├── plan.md                   # This file
├── research.md               # Phase 0 output
├── data-model.md             # Phase 1 output
├── quickstart.md             # Phase 1 output
├── contracts/
│   └── categories.openapi.yaml
└── tasks.md                  # Phase 2 output (/speckit.tasks) - não criado aqui
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
.
├── src/
│   ├── components/
│   │   ├── transactions/
│   │   │   ├── CategoryPopup.tsx
│   │   │   └── TransactionList.tsx
│   │   ├── budget/
│   │   └── layout/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useMonths.ts
│   │   ├── useTransactions.ts
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── pages/
│   │   ├── Budget.tsx
│   │   ├── Transactions.tsx
│   │   ├── Report.tsx
│   │   └── Settings.tsx
│   └── App.tsx
└── supabase/
  ├── migrations/
  └── functions/
```

**Structure Decision**: Web app (SPA) com Supabase como backend. As mudanças desta feature
se concentram em `supabase/migrations/` (schema + migração) e em `src/` (hooks e UI).

## Complexity Tracking

Nenhuma violação de constitution é necessária para este design.

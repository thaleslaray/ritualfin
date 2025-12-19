---

description: "Task list for Gerenciamento de Categorias"

---

# Tasks: Gerenciamento de Categorias

**Input**: Design documents from `/specs/002-add-categories/`  
**Prerequisites**: `specs/002-add-categories/plan.md`, `specs/002-add-categories/spec.md`, `specs/002-add-categories/research.md`, `specs/002-add-categories/data-model.md`, `specs/002-add-categories/contracts/categories.openapi.yaml`

**Tests**: Incluídos como tarefas mínimas (proporcionais ao risco) por exigência do Constitution Check em `specs/002-add-categories/plan.md`.

**Organization**: Tarefas agrupadas por fase e por user story (US1/US2/US3), para implementação e validação independentes.

## Format: `- [ ] T### [P?] [US?] Descrição com caminho de arquivo`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[US#]**: tarefa vinculada à user story
- **Todos os itens** incluem caminho(s) de arquivo

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar base local para desenvolver e validar a feature.

- [x] T001 Validar variáveis de ambiente do Supabase em `/Users/thaleslaray/code/projetos/ritualfin/.env` (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- [x] T002 Rodar lint como gate inicial via `package.json` (script `lint`) e corrigir o que bloquear a feature em `/Users/thaleslaray/code/projetos/ritualfin/eslint.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infra obrigatória (DB + base de leitura) que bloqueia qualquer user story.

- [x] T003 Criar migration para tabela `categories` + índices/constraints em `supabase/migrations/20251218090000_add_categories.sql`
- [x] T004 Habilitar RLS e criar policies por `couple_id` para `categories` em `supabase/migrations/20251218090000_add_categories.sql`
- [x] T005 Criar trigger para `updated_at` e para manter `display_name_normalized` consistente em `supabase/migrations/20251218090000_add_categories.sql`
- [x] T006 [P] Criar utilitários de normalização (case/space) e slugify (pt-BR/acentos) em `src/utils/categories.ts`
- [x] T007 [P] Adicionar testes unitários para `normalizeCategoryName` e `slugifyCategoryKey` em `src/utils/categories.test.ts`
- [x] T008 [P] Adicionar Vitest (devDependencies) e script `test` em `package.json`
- [x] T009 [P] Adicionar configuração mínima do Vitest (e ambiente jsdom se necessário) em `vitest.config.ts`
- [x] T010 [P] Adicionar setup de testes (se necessário para matchers) em `src/test/setup.ts`
- [x] T011 Criar hook de leitura de categorias (todas e ativas) com React Query em `src/hooks/useCategories.ts`
- [x] T012 [P] Criar função helper para resolver label por key (inclui fallback quando key não existe) em `src/utils/categoryDisplay.ts`
- [x] T013 Atualizar tipos do Supabase para incluir `categories` (e campos novos) em `src/integrations/supabase/types.ts`

**Checkpoint**: a base (DB + leitura + utils) está pronta; US1/US2/US3 podem começar.

---

## Phase 3: User Story 1 - Criar e organizar categorias do casal (Priority: P1) 🎯 MVP

**Goal**: Tela de gerenciamento de categorias (listar/criar/renomear/ativar-desativar/reordenar/excluir com regra).

**Independent Test**: Criar uma categoria, renomear e desativar outra; confirmar que a lista de categorias (ativas/inativas) atualiza e persiste após refresh.


- [x] T014 [P] [US1] Criar mutations (create/update/delete/reorder) no hook de categorias em `src/hooks/useCategories.ts`
- [x] T015 [P] [US1] Criar componente de formulário (nome) com validação Zod e react-hook-form em `src/components/categories/CategoryForm.tsx`
- [x] T016 [P] [US1] Criar componente de lista com estados (ativa/inativa) e ações (editar/ativar/desativar/excluir) em `src/components/categories/CategoryList.tsx`
- [x] T017 [US1] Implementar drag & drop/reorder (framer-motion) persistindo `sort_order` em `src/components/categories/CategoryList.tsx`
- [x] T018 [US1] Implementar página de categorias (layout + carregamento/erro + integração com hooks/components) em `src/pages/Categories.tsx`
- [x] T019 [US1] Adicionar rota protegida para categorias em `src/App.tsx`
- [x] T020 [US1] Adicionar entrada/atalho em configurações para a tela de categorias em `src/pages/Settings.tsx`
- [x] T021 [US1] Implementar regra de exclusão: bloquear delete quando categoria estiver em uso e sugerir desativação em `src/hooks/useCategories.ts`
- [x] T022 [US1] Exibir mensagens acionáveis (toast) para sucesso/erro (duplicidade, em uso, etc.) em `src/pages/Categories.tsx`


**Checkpoint**: US1 completo e validável sem depender de orçamento/transações.

---

## Phase 4: User Story 2 - Usar categorias personalizadas em orçamento e transações (Priority: P2)

**Goal**: Orçamento e transações passam a usar categorias vindas do banco (somente ativas para novas seleções) mantendo histórico legível.

**Independent Test**: Criar categoria em US1 e verificar que ela aparece: (a) no orçamento e (b) no popup de categoria da transação; ao desativar, some das opções de seleção.

- [x] T023 [US2] Substituir lista hardcoded do seletor de categorias por categorias ativas via hook em `src/components/transactions/CategoryPopup.tsx`
- [x] T024 [US2] Manter opção especial de “transferência interna” sem conflitar com categorias (`interno`) em `src/components/transactions/CategoryPopup.tsx`
- [x] T025 [US2] Garantir exibição de categoria em transações via lookup (inclui inativas) usando helper em `src/components/transactions/TransactionList.tsx`
- [x] T026 [US2] Atualizar fluxo de criação/edição de transação para salvar `category` como `categories.key` em `src/hooks/useTransactions.ts`
- [x] T027 [US2] Atualizar inputs de orçamento para iterar categorias (ativas e/ou todas conforme contexto) em `src/components/budget/CategoryBudgetInput.tsx`
- [x] T028 [US2] Ajustar criação de mês para inicializar `category_budgets` com base nas categorias ativas do casal em `src/hooks/useMonths.ts`
- [x] T029 [US2] Ajustar relatório para exibir `display_name` por key (lookup) em `src/pages/Report.tsx`
- [x] T030 [US2] Garantir que categorias inativas não apareçam como opção para novas seleções (orçamento/transações), mas histórico continue exibindo nome em `src/components/transactions/CategoryPopup.tsx`

**Checkpoint**: US2 completo e validável usando categorias reais do casal.

---

## Phase 5: User Story 3 - Manter compatibilidade com dados existentes (Priority: P3)

**Goal**: Instalações existentes não perdem histórico; strings antigas viram keys e tudo continua coerente.

**Independent Test**: Em um banco com transações/orçamentos já preenchidos, após aplicar migrations, as categorias continuam aparecendo (agora via key) sem “sumir” valores.

- [x] T031 [US3] Criar migration para seed de categorias padrão por casal (inclui `sort_order`) em `supabase/migrations/20251218091000_seed_categories_per_couple.sql`
- [x] T032 [US3] Criar migration para converter valores legados (nomes antigos) → `categories.key` em `supabase/migrations/20251218092000_migrate_category_strings_to_keys.sql`
- [x] T033 [US3] Incluir mapeamento explícito para PT-BR com acentos (ex.: "Alimentação" → `alimentacao`) na SQL de migração em `supabase/migrations/20251218092000_migrate_category_strings_to_keys.sql`
- [x] T034 [US3] Migrar `merchant_mappings.category` (quando existir valor legado) para keys em `supabase/migrations/20251218092000_migrate_category_strings_to_keys.sql`
- [x] T035 [US3] Adicionar fallback de compatibilidade no frontend (se encontrar valor não migrado, exibir string original) em `src/utils/categoryDisplay.ts`

**Checkpoint**: US3 completo; feature pronta para deploy sem quebrar dados antigos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, segurança, DX e validação final.

- [x] T036 [P] Documentar o novo comportamento (key vs display_name, regras de exclusão) em `specs/002-add-categories/quickstart.md`
- [ ] T037 Rodar validação manual do quickstart e checklist em `specs/002-add-categories/quickstart.md` (registrar observações no próprio arquivo)
- [x] T038 Ajustar estados de loading/erro/empty para UX calma (sem “tela morta”) em `src/pages/Categories.tsx`
- [x] T039 Rodar lint final e corrigir problemas em `package.json` (script `lint`) e arquivos tocados pela feature em `src/`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) → Foundational (Phase 2) → US1/US2/US3 → Polish

### Dependency Graph (story order)

```text
Phase 1 (Setup)
  |
  v
Phase 2 (Foundational)
  |\
  | \----> US3 (migração/compatibilidade) ---->
  |                                         |
  +----> US1 (gerenciar categorias) ----+    |
                            v    v
                          US2 (usar em orçamento/transações)
                            |
                            v
                     Phase 6 (Polish & validação)
```

### User Story Dependencies

- US1 depende de Phase 2 (schema + hook de leitura)
- US2 depende de Phase 2 e pode rodar **em paralelo** com US1 após o hook de leitura estar pronto
- US3 depende de Phase 2 e deve concluir antes de deploy em produção para usuários existentes

### Parallel Opportunities (high value)

- T006, T007, T008, T009, T010, T012 podem rodar em paralelo (arquivos isolados)
- Dentro da US1: T015 e T016 podem rodar em paralelo (componentes distintos)

---

## Parallel Execution Examples (per Story)

### US1

- Rodar em paralelo:
  - T015 em `src/components/categories/CategoryForm.tsx`
  - T016 em `src/components/categories/CategoryList.tsx`

### US2

- Rodar em paralelo (após T011):
  - T023 em `src/components/transactions/CategoryPopup.tsx`
  - T027 em `src/components/budget/CategoryBudgetInput.tsx`
  - T029 em `src/pages/Report.tsx`

### US3

- Rodar em paralelo:
  - T031 em `supabase/migrations/20251218091000_seed_categories_per_couple.sql`
  - T032 em `supabase/migrations/20251218092000_migrate_category_strings_to_keys.sql`

---

## Implementation Strategy

### MVP (US1)

1. Phase 1 + Phase 2
2. Implementar US1 (tela de categorias)
3. Validar independentemente (criar/renomear/desativar/reordenar)

### Incremental Delivery

1. Entregar US1
2. Entregar US2 (integração com orçamento/transações/relatório)
3. Entregar US3 (migração/compatibilidade) antes de produção

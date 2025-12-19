# Data Model — Gerenciamento de Categorias

**Feature**: `002-add-categories`  
**Date**: 2025-12-18

## Overview

O app atualmente usa strings em `category_budgets.category` e `transactions.category`.
Esta feature introduz uma entidade de **categoria por casal**, com identificador estável
`key/slug` e nome exibível mutável.

## Entities

### `categories`

Representa a lista de categorias de um casal.

**Fields (propostos)**

- `id` (uuid, PK)
- `couple_id` (uuid, FK → `couples.id`, NOT NULL)
- `key` (text, NOT NULL) — slug estável, auto-gerado e **imutável**
- `display_name` (text, NOT NULL) — nome exibido (mutável)
- `display_name_normalized` (text, NOT NULL) — normalização para unicidade (case-insensitive e
  colapso de espaços; idealmente remove acentos)
- `is_active` (boolean, NOT NULL, default true)
- `sort_order` (int, NOT NULL, default 0)
- `is_default` (boolean, NOT NULL, default false) — marca categorias seed
- `created_at` (timestamptz, NOT NULL, default now())
- `updated_at` (timestamptz, NOT NULL, default now())

**Constraints**

- Unique: `(couple_id, key)`
- Unique: `(couple_id, display_name_normalized)`

**Behavioral rules**

- `key` MUST NOT mudar após criação.
- Excluir (DELETE) MUST falhar se houver uso em orçamento/transações.

### Category references (existentes)

#### `category_budgets`

- Campo existente: `category` (text)
- **Novo contrato de conteúdo**: `category` armazena a `categories.key`.

Regra: cada mês pode ter no máximo uma linha por categoria: `UNIQUE(month_id, category)`.

#### `transactions`

- Campo existente: `category` (text, nullable)
- **Novo contrato de conteúdo**: quando presente, `category` armazena a `categories.key`.

Regra: transação pode ser “sem categoria” durante revisão.

#### `merchant_mappings`

- Campo existente: `category` (text)
- **Novo contrato de conteúdo**: alinhar para `categories.key`.

## Relationships

- `couples 1 → N categories`
- `months 1 → N category_budgets`
- `months 1 → N transactions`
- `category_budgets.category` references `categories.key` (soft reference, sem FK nesta fase)
- `transactions.category` references `categories.key` (soft reference, sem FK nesta fase)

## Migration notes

1. Criar `categories` e popular com categorias padrão para cada `couple_id` existente.
2. Mapear valores antigos (português com acentos) para keys:
   - `Moradia` → `moradia`
   - `Alimentação` → `alimentacao`
   - `Transporte` → `transporte`
   - `Saúde` → `saude`
   - `Lazer` → `lazer`
   - `Educação` → `educacao`
   - `Vestuário` → `vestuario`
   - `Outros` → `outros`
3. Atualizar `category_budgets.category` e `transactions.category` via join com `months`.
4. Atualizar `merchant_mappings.category` para keys equivalentes quando detectar valores legados.

## State transitions

- `is_active`: `true ↔ false` (reativável)
- `sort_order`: atualizado via reorder (drag & drop)
- `display_name`: mutável; ao mudar, recomputar `display_name_normalized`.

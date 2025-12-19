# Quickstart — Gerenciamento de Categorias

**Feature**: `002-add-categories`

## Pré-requisitos

- Bun instalado
- Acesso ao projeto Supabase configurado (URL + publishable key)

## Configuração

1. Verifique se o arquivo `.env` existe no root e contém:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. Instale dependências e rode o app:

- `bun install`
- `bun run dev`

## Banco de dados (Supabase)

Esta feature introduz migrations no diretório `supabase/migrations/` para:

- Criar tabela `categories` (por casal) + RLS
- Popular categorias padrão para casais existentes **e novos casais** (trigger em `couples`)
- Migrar valores legados em `category_budgets.category`, `transactions.category` e `merchant_mappings.category` para `categories.key`

Arquivos (na ordem):

- `supabase/migrations/20251218090000_add_categories.sql`
- `supabase/migrations/20251218091000_seed_categories_per_couple.sql`
- `supabase/migrations/20251218092000_migrate_category_strings_to_keys.sql`

Para aplicar migrations localmente, use o Supabase CLI (se configurado no seu ambiente).

## Checklist manual de validação (pós-implementação)

1. Ir em **Configurações → Categorias** (rota: `/categories`).
2. Criar categoria → aparece na lista e no popup de categorização de transações.
3. Renomear categoria → histórico continua e UI mostra o novo nome.
4. Desativar categoria → some das opções para **novas** seleções (transações), mas continua sendo exibida no histórico.
5. Excluir categoria não usada → remove com sucesso.
6. Tentar excluir categoria usada → bloqueia e sugere desativar.
7. Reordenar categorias → ordem persiste após reload e é refletida nas opções.

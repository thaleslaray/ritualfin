<!--
Sync Impact Report

- Version change: template placeholders → 1.0.0
- Modified principles: N/A (initial concrete constitution)
- Added sections:
	- Core Principles (concrete rules)
	- Product & Data Rules
	- Development Workflow & Quality Gates
	- Governance (amendment + compliance + versioning)
- Removed sections: none
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md (already references Constitution Check gate)
	- ✅ .specify/templates/spec-template.md (no changes required)
	- ✅ .specify/templates/tasks-template.md (no changes required)
	- ⚠ .specify/templates/commands/*.md (directory not present in this repo)
- Follow-up TODOs:
	- Decide whether to adopt an explicit PR template that includes a Constitution Check checkbox.
-->

# Ritual Financeiro Constitution

## Core Principles

### 1) Segurança e Privacidade por padrão (RLS é lei)

- Todo dado de usuário MUST ser segregado por `couple_id` e protegido por RLS no Supabase.
- O cliente web MUST usar apenas chave pública (anon/publishable) e MUST NOT usar service role.
- Edge Functions MUST validar JWT (`verify_jwt = true`) e MUST tratar `couple_id` como fronteira
	de autorização, não como input confiável.
- Logs MUST NOT conter PII (email, nome completo, dados sensíveis de transação) e MUST evitar
	conteúdo bruto de uploads.

Rationale: este app é financeiro; um único bypass de autorização é catastrófico.

### 2) Fonte de verdade única: banco primeiro

- O estado do domínio (meses, orçamentos, transações, importações) MUST viver no Postgres
	(Supabase). A UI é projeção, não fonte de verdade.
- Mudanças de schema MUST ser feitas via migrations em `supabase/migrations/`.
- Mudanças manuais no banco (sem migration) MUST NOT ser usadas como “atalho” em desenvolvimento.
- Toda escrita que altere comportamento do produto SHOULD gerar trilha/auditoria (ex.: `audit_logs`)
	quando aplicável.

Rationale: consistência e auditabilidade valem mais do que velocidade pontual.

### 3) Tipagem e validação nas bordas (TypeScript + Zod)

- Código em `src/` MUST ser type-safe e preferir tipos gerados do Supabase (`src/integrations/`).
- Entradas de usuário (forms, uploads, parâmetros de função) MUST ser validadas; para UI,
	preferir Zod.
- Conversões monetárias MUST ser consistentes. Ao tocar schema, preferir representação que evite
	erros de ponto flutuante (inteiro em centavos ou decimal com escala fixa) e documentar a escolha.

Rationale: bugs financeiros quase sempre nascem de input não validado e conversões inconsistentes.

### 4) UX calma: rápida, previsível e acessível

- Fluxos principais (Orçamento → Upload → Categorização → Relatório) MUST funcionar com estados
	de loading/erro claros e sem “telas mortas”.
- A UI MUST ser responsiva e navegável por teclado nas áreas críticas.
- Texto e formatação MUST seguir pt-BR (datas, moeda, rótulos) e evitar ambiguidade.

Rationale: o produto existe para reduzir ansiedade, não criar mais fricção.

### 5) Mudança segura: testes proporcionais + observabilidade

- `bun run lint` MUST passar antes de merge.
- Mudanças em regras de negócio críticas (categorização, fechamento de mês, importação)
	SHOULD vir com testes (unit/integration) proporcionais ao risco.
- Processos assíncronos (imports/edge functions) MUST ter logs úteis e mensagens de erro
	acionáveis para o usuário.

Rationale: importação e categorização são as áreas com maior risco e mais difíceis de depurar.

## Product & Data Rules

- Escopo de dados: todo registro pertence a um `couple_id`.
- `Month.year_month` MUST seguir o formato `YYYY-MM` e representar o mês-calendário do usuário.
- Fechamento de mês: ao fechar (`closed_at`), edições MUST ser bloqueadas por padrão. Se houver
	exceção de edição, ela MUST ser explicitamente sinalizada (`edited_after_close`) e auditável.
- Categorias: MUST existir uma lista coerente de identificadores de categoria usada por orçamento,
	transações e relatórios. Se houver customização, ela MUST preservar compatibilidade com dados
	já gravados (migração/alias).
- Movimentação interna: transações marcadas como transferência interna MUST ser tratadas fora do
	cálculo de “gasto real” quando aplicável e o comportamento MUST ser consistente no app.
- Uploads: arquivos MUST ser armazenados no bucket `uploads` sob pasta do casal
	(`{coupleId}/prints/...` ou `{coupleId}/ofx/...`) e MUST respeitar limites do bucket.

## Development Workflow & Quality Gates

- Ferramenta de pacotes: o projeto usa Bun (`bun.lockb`). Scripts MUST ser executáveis via `bun`.
- Variáveis de ambiente: o app depende de `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
	Esses valores MUST ser configurados localmente antes de rodar o app.
- Migrations: qualquer alteração em tabelas/RLS/functions MUST ser acompanhada de migration
	revisável e reversível quando razoável.
- PRs SHOULD ser pequenos, com descrição do impacto no domínio (ex.: orçamento, transações).
- Qualquer mudança que toque autorização, RLS ou storage MUST incluir revisão explícita de
	segurança (checagem manual das políticas).

## Governance

- Esta constituição é autoridade máxima para decisões de engenharia neste repositório.
- Processo de emenda:
	- MUST ser feita via PR dedicado ou PR com seção explícita “Constitution impact”.
	- MUST atualizar o Sync Impact Report (no topo deste arquivo).
	- MUST atualizar `Last Amended` e aplicar bump semver:
		- MAJOR: mudança incompatível em governança/princípios.
		- MINOR: novo princípio/seção ou expansão material.
		- PATCH: clarificações/editoriais.
	- SHOULD ter ao menos 1 revisor.
- Compliance em reviews:
	- Todo PR SHOULD incluir um “Constitution Check” (segurança/RLS, tipagem/validação,
		mudanças de schema, UX e observabilidade conforme aplicável).

**Version**: 1.0.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18

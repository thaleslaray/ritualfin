# Feature Specification: Gerenciamento de Categorias

**Feature Branch**: `002-add-categories`  
**Created**: 2025-12-18  
**Status**: Draft  
**Input**: User description: "Implementar gerenciamento de categorias"

## Clarifications

### Session 2025-12-18

- Q: Qual deve ser o identificador canônico da categoria (o que orçamento/transações salvam como referência)? → A: `key/slug` estável (string) como referência + `display_name` mutável.
- Q: As categorias padrão do app (as que vêm “de fábrica”) devem ser editáveis pelo usuário? → A: Totalmente editáveis (renomear + ativar/desativar + reordenar).
- Q: A `key/slug` deve ser auto-gerada e imutável? → A: Sim — auto-gerada na criação e imutável; depois só muda `display_name`.
- Q: O sistema deve permitir excluir uma categoria? → A: Sim, mas apenas se não usada; se já foi usada, só desativar.
- Q: Como o usuário define a ordem de exibição das categorias? → A: Manual (drag & drop) com persistência de `sort_order`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e organizar categorias do casal (Priority: P1)

Como pessoa usuária do app (membro de um casal), eu quero ver e gerenciar minha lista de
categorias para que orçamento e categorização reflitam a realidade do nosso mês.

**Why this priority**: Sem categorias editáveis, o orçamento e a categorização ficam engessados,
impedindo que o produto se adapte a diferentes perfis de casal.

**Independent Test**: Pode ser testado criando uma nova categoria, renomeando e desativando uma
existente e verificando que a lista disponível para seleção foi atualizada.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com acesso ao seu casal, **When** ele abre a área de
   gerenciamento de categorias, **Then** ele vê a lista de categorias ativas e inativas.
2. **Given** que o usuário está na lista de categorias, **When** ele cria uma nova categoria com
   um nome válido, **Then** a categoria aparece na lista como ativa e fica disponível para uso.
3. **Given** que existe uma categoria ativa, **When** o usuário renomeia essa categoria,
   **Then** o novo nome passa a aparecer em todo o app onde a categoria é exibida.
4. **Given** que existe uma categoria ativa, **When** o usuário a desativa,
   **Then** ela deixa de aparecer como opção para novas seleções, mas continua visível em
   registros históricos que já a utilizavam.

---

### User Story 2 - Usar categorias personalizadas em orçamento e transações (Priority: P2)

Como pessoa usuária, eu quero que as categorias que eu gerencio sejam as mesmas usadas no
orçamento mensal e na categorização de transações, para manter consistência entre “planejado” e
“real”.

**Why this priority**: O valor do produto vem da consistência: a mesma categoria precisa ser
usável no orçamento e nas transações; caso contrário, o relatório perde confiança.

**Independent Test**: Pode ser testado criando uma categoria e verificando que ela aparece nas
opções de orçamento e de categorização; ao desativá-la, verificar que some das opções.

**Acceptance Scenarios**:

1. **Given** uma categoria ativa, **When** o usuário ajusta seu orçamento, **Then** ele consegue
   planejar valores usando essa categoria.
2. **Given** uma categoria ativa, **When** o usuário categoriza uma transação,
   **Then** ele consegue selecionar essa categoria e a transação passa a ser considerada no
   relatório daquela categoria.
3. **Given** uma categoria inativa, **When** o usuário tenta categorizar uma nova transação,
   **Then** essa categoria não aparece como opção selecionável.
4. **Given** uma categoria renomeada, **When** o usuário navega por transações e relatórios,
   **Then** o nome exibido é o nome atual (renomeado), mantendo o histórico legível.

---

### User Story 3 - Manter compatibilidade com dados existentes (Priority: P3)

Como pessoa usuária que já usou o app antes desta mudança, eu quero que minhas categorias já
existentes e meu histórico continuem coerentes, para não perder dados nem relatórios.

**Why this priority**: Mudanças em categorias tendem a quebrar histórico e relatórios se não forem
compatíveis; isso mina a confiança no produto.

**Independent Test**: Pode ser testado com uma base já populada (orçamentos e transações
existentes), verificando que nada “some” após a atualização.

**Acceptance Scenarios**:

1. **Given** um usuário com orçamentos e transações já categorizados, **When** o app é atualizado
   com o gerenciamento de categorias, **Then** os dados continuam aparecendo nas mesmas categorias
   (sem perda de valores e sem categorias “quebradas”).
2. **Given** categorias padrão do app, **When** o usuário não faz nenhuma personalização,
   **Then** a experiência permanece equivalente à atual (mesmas categorias disponíveis).

---

### Edge Cases

- Nome de categoria duplicado (diferenças apenas de maiúsculas/minúsculas ou espaços).
- Renomear categoria para um nome já existente.
- Criar categoria cujo nome gere `key/slug` já existente (colisão de slug).
- Desativar categoria que já está em uso (orçamento e/ou transações).
- Tentar excluir categoria que já está em uso (deve bloquear e orientar desativação).
- Reativar uma categoria anteriormente desativada.
- Usuário tenta criar muitas categorias (lista grande) e ainda precisa encontrar rapidamente.
- Dois usuários do mesmo casal editam categorias ao mesmo tempo.
- Conflito de ordenação quando dois usuários reordenam simultaneamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que usuários autenticados visualizem a lista de categorias do
  seu casal, incluindo status (ativa/inativa).
- **FR-002**: O sistema MUST permitir que usuários criem uma nova categoria para o seu casal.
- **FR-003**: O sistema MUST permitir que usuários renomeiem uma categoria existente.
- **FR-004**: O sistema MUST permitir que usuários ativem/desativem uma categoria.
- **FR-004a**: O sistema MUST tratar categorias “padrão” e “criadas pelo usuário” de forma
  uniforme: ambas MUST poder ser renomeadas, ativadas/desativadas e reordenadas.
- **FR-004b**: O sistema MUST permitir excluir (remoção definitiva) uma categoria APENAS quando
  ela não tiver sido usada em orçamento e nem em transações.
- **FR-004c**: Se a categoria já tiver sido usada, o sistema MUST bloquear exclusão e MUST
  oferecer a alternativa de desativar.
- **FR-011**: O sistema MUST permitir reordenar categorias manualmente (drag & drop) e MUST
  persistir a ordem de exibição (`sort_order`) por casal.
- **FR-005**: O sistema MUST garantir unicidade de nome de categoria por casal (comparação
  case-insensitive e ignorando espaços excedentes).
- **FR-005a**: O sistema MUST manter um identificador canônico estável por categoria (a
  `key/slug`), independente do nome exibido.
- **FR-005b**: Registros que referenciam categorias (orçamento, transações, relatórios) MUST
  referenciar a categoria pela `key/slug` (e não pelo nome exibido).
- **FR-005c**: O sistema MUST gerar a `key/slug` automaticamente na criação da categoria e MUST
  impedir edição posterior desse identificador.
- **FR-005d**: O sistema MUST garantir unicidade da `key/slug` por casal.
- **FR-006**: O sistema MUST disponibilizar apenas categorias ativas para novas seleções em fluxos
  de planejamento (orçamento) e de categorização (transações).
- **FR-007**: O sistema MUST preservar histórico: registros previamente associados a uma categoria
  MUST continuar exibindo a categoria, mesmo que ela se torne inativa.
- **FR-008**: O sistema MUST impedir perda de dados na atualização: categorias e associações
  existentes MUST permanecer consistentes após a mudança.
- **FR-009**: O sistema MUST aplicar controle de acesso: usuários MUST acessar somente categorias
  do seu próprio casal.
- **FR-010**: O sistema MUST fornecer mensagens claras de validação e erro (ex.: nome inválido,
  duplicado, ou operação não permitida).

### Key Entities *(include if feature involves data)*

- **Category**: Representa uma categoria de gastos/planejamento do casal.
  - Atributos-chave: `key/slug` (identificador canônico, estável e imutável), casal,
    `display_name` (nome exibido e mutável), status (ativa/inativa), `sort_order` (ordem
    de exibição), timestamps.
- **Category Reference**: Representa o vínculo lógico de uma categoria com registros do domínio
  (orçamento e transações).
  - Regras: deve preservar histórico e manter consistência após renomes/ativação/desativação.

### Assumptions *(optional)*

- Categorias são gerenciadas por casal (não por indivíduo).
- “Desativar” é preferível a “apagar”, para preservar histórico e relatórios.
- A lista inicial mantém as categorias padrão já existentes no produto, e elas são editáveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem criar e ver uma nova categoria ativa em até 30 segundos
  (a partir da tela de categorias), sem necessidade de suporte.
- **SC-002**: Pelo menos 95% das tentativas de criar/renomear categoria com nome válido concluem
  com sucesso na primeira tentativa (sem erros de validação evitáveis).
- **SC-003**: Após a entrega, 0% dos usuários perdem acesso ao histórico de transações e valores
  planejados por mudança de categorias (nenhuma perda de dados atribuível ao recurso).
- **SC-004**: Usuários conseguem concluir o fluxo “criar categoria → usar em orçamento → usar em
  transação → ver no relatório” em menos de 3 minutos.

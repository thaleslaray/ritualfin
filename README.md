# RitualFin 💰

**Gerenciamento financeiro para casais, sem drama.**

RitualFin é um aplicativo de controle financeiro pessoal baseado em rituais semanais que torna o gerenciamento de orçamento simples e eficiente. Perfeito para casais que desejam ter clareza financeira em apenas 10 minutos por semana.

## ✨ O que é RitualFin?

RitualFin transforma o controle financeiro em um processo simples através de rituais estruturados:

### 🗓️ **Ritual Dia 1** (Início do Mês)
Configure seu orçamento mensal em 10 minutos:
- Cadastre contas fixas (boletos, financiamentos, cartões)
- Defina quanto gastar em cada categoria (alimentação, transporte, lazer, etc.)
- Clone o orçamento do mês anterior para economizar tempo

### 📤 **Ritual Semanal** (Quartas-feiras)
Mantenha seus dados atualizados:
- Envie prints de cartão de crédito ou arquivos OFX
- O sistema extrai transações automaticamente usando OCR
- Categorize transações pendentes com sugestões inteligentes

### 📊 **Acompanhamento Contínuo**
- Veja em tempo real: Planejado vs Real
- Identifique economia ou gastos acima do orçamento
- Exporte relatórios detalhados em CSV

## 🎯 Funcionalidades Principais

### 📱 Dashboard Intuitivo
- Visão geral do mês atual
- Economia do mês em destaque
- Próxima ação recomendada
- Status de transações pendentes
- Checklist de configuração para novos usuários

### 💳 Gerenciamento de Orçamento
- Cadastro de contas recorrentes (boletos, financiamentos)
- Definição de limites por categoria
- Controle de cartões de crédito
- Clonagem de orçamento mensal
- Fechamento de mês com ritual de confetes! 🎉

### 📥 Upload e Processamento Inteligente
- Drag & drop de prints de cartão
- Importação de arquivos OFX
- Extração automática via OCR
- Histórico de uploads processados

### 🏷️ Categorização Inteligente
- Sugestões automáticas de categoria
- Categorias personalizadas
- Marcação de transações internas
- Busca e filtros avançados
- Sistema de confiança nas sugestões

### 📈 Relatórios Detalhados
- Comparação por categoria
- Progresso visual com gráficos
- Uso de cartões de crédito
- Exportação para CSV
- Análise de tendências

### ⚙️ Configurações
- Gerenciamento de perfil
- Contas bancárias
- Categorias personalizadas
- Tema claro/escuro
- Logout seguro

## 🚀 Como Começar

### Pré-requisitos
- Node.js 16+ instalado
- Conta no Supabase (para backend)

### Instalação Local

```sh
# Clone o repositório
git clone <URL_DO_SEU_REPOSITORIO>

# Entre no diretório
cd ritualfin

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com:
# VITE_SUPABASE_URL=sua_url_do_supabase
# VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
# VITE_SUPABASE_PROJECT_ID=seu_project_id

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Comandos Disponíveis

```sh
npm run dev        # Inicia servidor de desenvolvimento
npm run build      # Compila para produção
npm run preview    # Preview da build de produção
npm run lint       # Executa o linter
```

## 🛠️ Tecnologias

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth + Database + Storage)
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 📂 Estrutura do Projeto

```
ritualfin/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── brand/       # Logo e identidade visual
│   │   ├── budget/      # Componentes de orçamento
│   │   ├── layout/      # Layout da aplicação
│   │   ├── onboarding/  # Wizard de boas-vindas
│   │   ├── transactions/# Componentes de transações
│   │   └── ui/          # Componentes UI do shadcn
│   ├── contexts/        # Contextos React (Auth)
│   ├── hooks/           # Custom hooks
│   ├── integrations/    # Integração com Supabase
│   ├── pages/           # Páginas da aplicação
│   ├── utils/           # Funções utilitárias
│   └── lib/             # Configurações de libs
├── public/              # Arquivos estáticos
└── supabase/            # Migrações e funções do banco
```

## 🎨 Principais Páginas

- **`/`** - Dashboard principal com visão geral
- **`/budget`** - Ritual Dia 1: configuração de orçamento
- **`/uploads`** - Upload de prints e arquivos OFX
- **`/transactions`** - Categorização e gerenciamento de transações
- **`/report`** - Relatórios e análises detalhadas
- **`/settings`** - Configurações da conta
- **`/auth`** - Autenticação e login

## 🔐 Segurança

- Autenticação via Supabase
- Row Level Security (RLS) no banco de dados
- Proteção de rotas com `ProtectedRoute`
- Dados compartilhados apenas entre casais autorizados

## 📝 Licença

Este projeto é de uso pessoal.

## 👥 Autores

Desenvolvido por Thales Laray

---

**RitualFin** - Clareza financeira em 10 minutos por semana ⏰💰

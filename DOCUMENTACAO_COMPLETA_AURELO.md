# 📘 Documentação Completa - Aurelo

**Versão:** 1.0.0  
**Data:** Dezembro 2024  
**Plataforma:** Web (Next.js)

---

## 📋 Sumário

1. [Visão de Negócio](#visão-de-negócio)
2. [Funcionalidades Implementadas](#funcionalidades-implementadas)
3. [Características Técnicas](#características-técnicas)
4. [Arquitetura do Sistema](#arquitetura-do-sistema)
5. [Design System](#design-system)
6. [Segurança e Privacidade](#segurança-e-privacidade)
7. [Integrações](#integrações)
8. [Banco de Dados](#banco-de-dados)
9. [Status do Projeto](#status-do-projeto)

---

## 🎯 Visão de Negócio

### Missão
Aurelo é uma plataforma digital desenvolvida para profissionais da área da saúde (enfermeiros, técnicos, auxiliares) gerenciarem suas escalas de trabalho de forma inteligente, otimizando ganhos, prevenindo burnout e facilitando a troca de plantões entre colegas.

### Problema que Resolve
- **Gestão Complexa de Escalas**: Profissionais da saúde trabalham em múltiplas instituições com diferentes contratos (CLT, PJ, Informal), dificultando o controle financeiro e de horas trabalhadas.
- **Risco de Burnout**: Falta de visibilidade sobre horas trabalhadas e sobrecarga de trabalho.
- **Dificuldade em Trocar Plantões**: Processo manual e demorado para encontrar colegas disponíveis para trocar plantões.
- **Falta de Insights Financeiros**: Dificuldade em visualizar ganhos por instituição, mês e projetar receitas futuras.

### Proposta de Valor
- **Gestão Unificada**: Centralize todas as escalas em um único lugar, independente do número de vínculos de trabalho.
- **Inteligência Artificial**: Assistente virtual que responde perguntas sobre escalas, ganhos e horas trabalhadas.
- **Rede Social Profissional**: Sistema de amigos para facilitar trocas de plantões de forma segura e privada.
- **Prevenção de Burnout**: Alertas automáticos sobre sobrecarga de trabalho e risco de burnout.
- **Insights Financeiros**: Visualizações gráficas e relatórios detalhados de ganhos por instituição e período.

### Público-Alvo
- Enfermeiros
- Técnicos de Enfermagem
- Auxiliares de Enfermagem
- Outros profissionais da saúde com múltiplos vínculos de trabalho

---

## ✨ Funcionalidades Implementadas

### 1. Autenticação e Onboarding

#### Login e Cadastro (`/login`)
- ✅ Autenticação via email e senha (Supabase Auth)
- ✅ Criação de conta com validação de formulário
- ✅ Redirecionamento automático para usuários autenticados
- ✅ Interface com glassmorphism e animações suaves
- ✅ Logo animado da marca

#### Onboarding (`/onboarding`)
- ✅ **Passo 1 - Perfil**: Coleta nome completo e função (enfermeiro, técnico, auxiliar)
- ✅ **Passo 2 - Vínculos de Trabalho**: 
  - Adicionar múltiplos vínculos de trabalho
  - Configurar: nome da instituição, tipo de contrato (CLT, PJ, Informal), valor por hora
  - Cores personalizadas por instituição
  - Remover vínculos antes de finalizar
- ✅ Validação completa de formulários (React Hook Form + Zod)
- ✅ Stepper visual com indicadores de progresso

### 2. Dashboard Principal (`/`)

#### Visão Geral
- ✅ **Próximo Plantão**: Card destacado mostrando o próximo plantão agendado com data, horário e instituição
- ✅ **Ganhos Estimados do Mês**: Soma total dos valores estimados de todos os plantões do mês atual
- ✅ **Widget de Burnout**: 
  - Cálculo automático de horas trabalhadas no mês
  - Classificação de risco (Baixo, Médio, Alto)
  - Cores semânticas (verde, amarelo, vermelho)
  - Recomendações baseadas em horas trabalhadas
- ✅ **Escala da Semana**: Lista dos próximos 3 plantões com cards informativos
- ✅ **Botão "Novo Plantão"**: Acesso rápido para adicionar novo plantão

#### Assistente IA
- ✅ Chat flutuante com Aurelo AI
- ✅ Respostas contextuais sobre:
  - Ganhos do mês
  - Próximos plantões
  - Horas trabalhadas
  - Risco de burnout
  - Estatísticas gerais
- ✅ Histórico de conversas persistido
- ✅ Interface com animações e feedback visual

### 3. Gestão de Escalas (`/escala`)

#### Calendário Interativo
- ✅ Calendário mensal com seleção de datas
- ✅ **Indicadores Visuais**: Bolhas coloridas nos dias com plantões agendados
- ✅ Navegação entre meses
- ✅ Destaque visual para o dia selecionado

#### Filtros e Visualização
- ✅ **Filtro por Instituição**: Dropdown para filtrar plantões por hospital/clínica
- ✅ **Lista de Plantões**: Exibe todos os plantões do dia selecionado
- ✅ Cards informativos com:
  - Data e horário (início e fim)
  - Instituição com cor personalizada
  - Valor estimado
  - Notas (se houver)

#### Operações CRUD
- ✅ **Adicionar Plantão**: 
  - Modal com formulário completo
  - Seleção de data (com calendário popover)
  - Seleção de instituição (vínculo de trabalho)
  - Horário de início e fim
  - Valor estimado (opcional)
  - Notas (opcional)
  - Suporte a plantões noturnos (que passam da meia-noite)
- ✅ **Editar Plantão**: Modal pré-preenchido com todos os dados
- ✅ **Excluir Plantão**: Com confirmação antes de remover

### 4. Gestão Financeira (`/financas`)

#### Dashboard Financeiro
- ✅ **Total do Mês**: Card principal com ganhos totais em R$
- ✅ **Filtro por Período**: Dropdown para selecionar mês/ano específico
- ✅ **Gráfico de Barras**: Distribuição de ganhos por instituição (Recharts)
- ✅ **Gráfico de Pizza**: Distribuição percentual de ganhos por instituição
- ✅ **Resumo por Instituição**: Cards coloridos mostrando:
  - Nome da instituição
  - Total ganho no período
  - Quantidade de plantões
  - Média por plantão

#### Extrato Detalhado
- ✅ **Histórico Completo**: Lista ordenada por data de todos os plantões
- ✅ Informações por plantão:
  - Data e horário
  - Instituição
  - Valor recebido
  - Status (agendado, concluído, cancelado)

#### Exportação
- ✅ **Exportar PDF**: Geração de relatório financeiro em PDF (jsPDF + jspdf-autotable)
- ✅ Relatório inclui:
  - Resumo executivo
  - Gráficos
  - Extrato detalhado
  - Totalizadores por instituição

### 5. Sistema de Trocas de Plantões (`/trocas`)

#### Anúncios de Troca
- ✅ **Três Tipos de Anúncio**:
  - **Oferta**: Usuário tem um plantão e quer passar/vender
  - **Solicitação**: Usuário precisa de um plantão em data específica
  - **Troca**: Usuário quer trocar um plantão por outro em data diferente
- ✅ Formulário intuitivo com descrições claras de cada tipo
- ✅ Seleção de plantão existente (para ofertas e trocas)
- ✅ Seleção de data desejada (para solicitações e trocas)
- ✅ Seleção de instituição desejada (opcional)
- ✅ Campo de observações

#### Visualização de Oportunidades
- ✅ **Lista de Oportunidades**: Cards visuais diferenciados por tipo
- ✅ **Filtros**: Por tipo de anúncio (Oferta, Solicitação, Troca)
- ✅ **Informações Exibidas**:
  - Nome e profissão do anunciante
  - Tipo de anúncio com badge colorido
  - Data e horário do plantão
  - Instituição
  - Observações
  - Contador de interesses
- ✅ **Sistema de Interesses**: Botão "Tenho Interesse" com mensagem opcional

#### Aceitação de Trocas
- ✅ **Atualização Automática de Escala**: Quando uma oferta é aceita:
  - Plantão é transferido para o interessado (adicionado na escala dele)
  - Plantão original é cancelado na escala do anunciante
- ✅ Revalidação automática das páginas após aceitar

#### Privacidade
- ✅ **Filtro de Amigos**: Apenas anúncios de amigos são exibidos
- ✅ Sistema garante que apenas usuários conectados como amigos podem ver e aceitar trocas

### 6. Sistema de Amigos (`/amigos`)

#### Gerenciamento de Amizades
- ✅ **Lista de Amigos**: Visualização de todos os amigos aceitos
- ✅ **Solicitações Recebidas**: Lista de solicitações pendentes com opções de aceitar/rejeitar
- ✅ **Solicitações Enviadas**: Acompanhamento de solicitações enviadas
- ✅ Cards visuais com avatar, nome e profissão

#### Adicionar Amigos
- ✅ **Três Métodos de Adição**:
  - **Busca**: Buscar por nome, profissão ou código de amigo
  - **Email**: Enviar convite por email
  - **Código Aurelo**: Usar código único do perfil do amigo
- ✅ Interface com abas para cada método
- ✅ Validação e feedback em tempo real

#### Código Aurelo
- ✅ **Código Único**: Cada usuário possui um código único de 8 caracteres
- ✅ Exibição no perfil com botão de copiar
- ✅ Geração automática se não existir
- ✅ Busca por código para adicionar amigos rapidamente

### 7. Perfil do Usuário (`/perfil`)

#### Informações Pessoais
- ✅ **Visualização de Perfil**:
  - Avatar com iniciais
  - Nome completo
  - Profissão/Role
  - **Email** (destacado como informação principal)
  - Código Aurelo
- ✅ **Edição de Perfil**: Modal para atualizar nome e profissão

#### Vínculos de Trabalho
- ✅ **Lista de Vínculos**: Todos os vínculos cadastrados
- ✅ **Adicionar Vínculo**: Formulário completo
- ✅ **Editar Vínculo**: Atualizar informações
- ✅ **Excluir Vínculo**: Com confirmação

#### Preferências
- ✅ **Meta Mensal**: Definir meta de ganhos mensais
- ✅ **Limite Semanal**: Definir limite de horas semanais
- ✅ Salvamento automático

#### Logout
- ✅ Botão de logout com limpeza completa de sessão
- ✅ Redirecionamento para página de login

### 8. OCR - Reconhecimento de Escalas (`/ocr`)

#### Upload e Processamento
- ✅ **Upload de Imagem**: Interface drag-and-drop para upload de escalas
- ✅ **Processamento com IA**: Integração com OpenAI Vision API (GPT-4o)
- ✅ **Extração Automática**: Identifica automaticamente:
  - Datas dos plantões
  - Horários (início e fim)
  - Instituições
  - Valores (se disponíveis)

#### Edição e Confirmação
- ✅ **Lista Editável**: Plantões identificados exibidos em lista
- ✅ **Edição Inline**: Possibilidade de corrigir informações antes de salvar
- ✅ **Confirmação em Lote**: Adicionar todos os plantões de uma vez
- ✅ Validação antes de salvar

### 9. Notificações

#### Sistema de Notificações
- ✅ **Sino de Notificações**: Badge com contador de não lidas
- ✅ **Tipos de Notificação**:
  - Lembretes de plantões
  - Interesses em trocas
  - Alertas de burnout
  - Conquistas de metas
  - Match de trocas
- ✅ **Popover de Notificações**: Lista completa com scroll
- ✅ **Marcar como Lida**: Individual ou todas de uma vez
- ✅ **Navegação**: Links diretos para ações relacionadas

#### Notificações Automáticas
- ✅ Criação automática de notificações para:
  - Interesses em trocas
  - Alertas de burnout
  - Lembretes de plantões próximos

---

## 🛠️ Características Técnicas

### Stack Tecnológico

#### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Estilização**: 
  - Tailwind CSS v4
  - Design System "Liquid UI" (glassmorphism, bordas arredondadas, sombras suaves)
- **Animações**: Framer Motion 12.23.24
- **Componentes UI**: Shadcn/ui (Radix UI)
- **Formulários**: React Hook Form 7.66.1 + Zod 4.1.12
- **Gráficos**: Recharts 3.4.1
- **PDF**: jsPDF 3.0.4 + jspdf-autotable 5.0.2
- **Notificações**: Sonner 2.0.7
- **Ícones**: Lucide React 0.554.0

#### Backend
- **BaaS**: Supabase
  - Autenticação (Supabase Auth)
  - Banco de Dados PostgreSQL
  - Row Level Security (RLS)
  - Storage (futuro)
- **Server Actions**: Next.js Server Actions para lógica de negócio

#### Integrações de IA
- **OpenAI**: 
  - GPT-4o para chat assistente
  - GPT-4 Vision para OCR de escalas

#### Estado Global
- **Zustand**: 5.0.8
  - Gerenciamento de estado de plantões
  - Gerenciamento de estado de trocas
  - Persistência local (localStorage)

### Performance e Otimizações

- ✅ **Server Components**: Uso de React Server Components onde apropriado
- ✅ **Code Splitting**: Automático via Next.js
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Lazy Loading**: Componentes carregados sob demanda
- ✅ **Memoização**: React.memo e useMemo para otimização de re-renders
- ✅ **Debounce**: Em buscas e inputs
- ✅ **Caching**: Revalidação de cache com revalidatePath

### Responsividade

- ✅ **Mobile First**: Design otimizado para dispositivos móveis
- ✅ **Navegação Mobile**: Barra inferior fixa com 5 ícones principais
- ✅ **Navegação Desktop**: Barra superior com links expandidos
- ✅ **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   │   ├── chat.ts
│   │   ├── export-pdf.ts
│   │   ├── friends.ts
│   │   ├── notifications.ts
│   │   ├── ocr.ts
│   │   └── shift-swaps.ts
│   ├── amigos/            # Página de Amigos
│   ├── escala/            # Página de Escala
│   ├── financas/          # Página de Finanças
│   ├── login/             # Página de Login
│   ├── ocr/               # Página de OCR
│   ├── onboarding/        # Página de Onboarding
│   ├── perfil/            # Página de Perfil
│   └── trocas/            # Página de Trocas
├── components/
│   ├── features/          # Componentes de funcionalidades
│   │   ├── assistant/     # Chat IA
│   │   ├── calendar/      # Calendário
│   │   ├── friends/       # Sistema de amigos
│   │   ├── notifications/ # Notificações
│   │   ├── ocr/           # OCR
│   │   ├── onboarding/    # Onboarding
│   │   ├── shifts/        # Plantões
│   │   └── swaps/         # Trocas
│   ├── layout/            # Componentes de layout
│   │   ├── app-shell.tsx  # Shell principal
│   │   └── mobile-nav.tsx # Navegação mobile
│   └── ui/                # Componentes UI base
├── lib/                   # Bibliotecas e utilitários
│   ├── supabase/          # Clientes Supabase
│   ├── pdf/               # Geração de PDF
│   └── utils.ts           # Funções utilitárias
├── store/                 # Zustand stores
│   ├── useShiftsStore.ts
│   ├── useShiftSwapsStore.ts
│   └── useNotificationsStore.ts
└── types/                 # TypeScript types
    └── database.types.ts
```

### Fluxo de Dados

```
Cliente (Browser)
    ↓
Next.js App Router
    ↓
Server Actions / API Routes
    ↓
Supabase Client
    ↓
PostgreSQL Database
```

### Autenticação

- **Fluxo**: Supabase Auth com email/senha
- **Middleware**: Proteção de rotas via Next.js Middleware
- **RLS**: Row Level Security no banco de dados
- **Sessão**: Gerenciada pelo Supabase SSR

---

## 🎨 Design System

### Identidade Visual "Liquid UI"

#### Princípios
- **Glassmorphism**: Efeito de vidro fosco com backdrop-blur
- **Bordas Arredondadas**: Raio de 2xl (16px) a 3xl (24px)
- **Sombras Suaves**: Múltiplas camadas de sombra para profundidade
- **Cores Pastéis**: Paleta suave e acolhedora
- **Animações Suaves**: Transições fluidas com Framer Motion

#### Paleta de Cores
- **Primary**: Azul suave (cores primárias)
- **Accent**: Cor de destaque complementar
- **Background**: Fundo com gradientes sutis
- **Foreground**: Texto principal
- **Muted**: Texto secundário e elementos desabilitados
- **Destructive**: Ações destrutivas (vermelho suave)

#### Tipografia
- **Fonte Principal**: Inter (Google Fonts)
- **Hierarquia**: Títulos, subtítulos, corpo, pequeno
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

#### Componentes Base
- ✅ Button: Múltiplas variantes (default, outline, ghost, secondary)
- ✅ Card: Glassmorphism com bordas arredondadas
- ✅ Input: Com focus ring animado
- ✅ Dialog: Modal com backdrop blur
- ✅ Badge: Tags coloridas
- ✅ Avatar: Com anel de status animado
- ✅ Calendar: Calendário customizado
- ✅ Tabs: Com indicador deslizante

#### Animações
- ✅ **Page Transitions**: Fade e slide entre páginas
- ✅ **Hover Effects**: Escala e sombra em interações
- ✅ **Loading States**: Spinners e skeletons
- ✅ **Micro-interações**: Feedback visual em todas as ações

---

## 🔒 Segurança e Privacidade

### Autenticação
- ✅ **Supabase Auth**: Sistema robusto de autenticação
- ✅ **Hash de Senhas**: Bcrypt automático
- ✅ **Sessões Seguras**: Tokens JWT gerenciados pelo Supabase
- ✅ **Proteção CSRF**: Incluída no Next.js

### Row Level Security (RLS)
- ✅ **Políticas RLS**: Implementadas em todas as tabelas
- ✅ **Isolamento de Dados**: Usuários só acessam seus próprios dados
- ✅ **Políticas Granulares**: SELECT, INSERT, UPDATE, DELETE por tabela

### Privacidade
- ✅ **Dados Isolados**: Cada usuário vê apenas seus dados
- ✅ **Sistema de Amigos**: Trocas visíveis apenas entre amigos
- ✅ **Código Aurelo**: Código único para adicionar amigos sem expor email
- ✅ **Sem Compartilhamento**: Dados financeiros e escalas são privados

### Validação
- ✅ **Validação Client-Side**: Zod schemas
- ✅ **Validação Server-Side**: Server Actions validam antes de salvar
- ✅ **Sanitização**: Inputs sanitizados antes de processar

---

## 🔌 Integrações

### Supabase
- ✅ **Autenticação**: Login, cadastro, sessões
- ✅ **Banco de Dados**: PostgreSQL com RLS
- ✅ **Storage**: Preparado para upload de avatares e documentos (futuro)

### OpenAI
- ✅ **GPT-4o**: Chat assistente com contexto do usuário
- ✅ **GPT-4 Vision**: OCR de escalas de trabalho
- ✅ **Rate Limiting**: Implementado para evitar custos excessivos

### APIs Futuras
- 🔄 **Notificações Push**: Para alertas em tempo real
- 🔄 **Email**: Envio de convites e notificações
- 🔄 **Calendário**: Sincronização com Google Calendar/Apple Calendar

---

## 💾 Banco de Dados

### Tabelas Principais

#### `profiles`
- Informações do perfil do usuário
- Campos: id, full_name, avatar_url, role, monthly_goal, weekly_hours_limit, friend_code
- RLS: Usuário só acessa seu próprio perfil

#### `work_relations`
- Vínculos de trabalho (instituições)
- Campos: id, user_id, institution_name, contract_type, hourly_rate, standard_shift_value, color
- RLS: Usuário só acessa seus próprios vínculos

#### `shifts`
- Plantões agendados
- Campos: id, user_id, work_relation_id, start_time, end_time, status, estimated_value, notes
- RLS: Usuário só acessa seus próprios plantões

#### `shift_swaps`
- Anúncios de troca de plantões
- Campos: id, user_id, shift_id, swap_type, desired_date, desired_institution_id, status, description
- RLS: Usuários veem apenas anúncios abertos ou seus próprios

#### `swap_interests`
- Interesses em trocas
- Campos: id, swap_id, interested_user_id, message, status
- RLS: Usuário vê apenas seus próprios interesses

#### `friends`
- Relacionamentos de amizade
- Campos: id, user_id, friend_id, status
- RLS: Usuário vê apenas suas próprias amizades

#### `friend_requests`
- Solicitações de amizade
- Campos: id, from_user_id, to_user_id, to_email, invite_code, status, message
- RLS: Usuário vê apenas suas próprias solicitações

#### `notifications`
- Notificações do sistema
- Campos: id, user_id, type, title, message, link, read, created_at
- RLS: Usuário vê apenas suas próprias notificações

### Índices e Performance
- ✅ Índices em foreign keys
- ✅ Índices em campos de busca (friend_code, status)
- ✅ Índices em campos de ordenação (created_at, start_time)

### Funções SQL
- ✅ `generate_invite_code()`: Gera códigos únicos
- ✅ `get_profile_by_friend_code()`: Busca segura por código
- ✅ `get_profile_by_friend_code_or_name()`: Busca por código ou nome
- ✅ `clean_old_notifications()`: Limpeza automática de notificações antigas

---

## 📊 Status do Projeto

### ✅ Funcionalidades Completas

#### Autenticação e Onboarding
- [x] Login e cadastro
- [x] Onboarding em 2 passos
- [x] Validação de formulários

#### Gestão de Escalas
- [x] Calendário interativo
- [x] CRUD completo de plantões
- [x] Filtros por data e instituição
- [x] Suporte a múltiplos vínculos

#### Gestão Financeira
- [x] Dashboard com gráficos
- [x] Filtros por período
- [x] Exportação em PDF
- [x] Resumo por instituição

#### Sistema de Trocas
- [x] Três tipos de anúncio
- [x] Sistema de interesses
- [x] Aceitação automática
- [x] Filtro de amigos

#### Sistema de Amigos
- [x] Adicionar por busca, email ou código
- [x] Gerenciar solicitações
- [x] Código Aurelo único

#### OCR
- [x] Upload de imagens
- [x] Processamento com IA
- [x] Edição e confirmação

#### Notificações
- [x] Sistema completo
- [x] Badge de não lidas
- [x] Notificações automáticas

#### Assistente IA
- [x] Chat contextual
- [x] Respostas sobre escalas e ganhos
- [x] Histórico persistido

### 🔄 Funcionalidades em Melhoria

- [ ] Notificações push em tempo real
- [ ] Sincronização com calendários externos
- [ ] App mobile nativo
- [ ] Modo offline
- [ ] Exportação de dados

### 📈 Métricas e Analytics

- [ ] Dashboard de analytics para usuários
- [ ] Relatórios de produtividade
- [ ] Histórico de trocas realizadas
- [ ] Estatísticas de uso

---

## 🚀 Próximos Passos

### Curto Prazo
1. Otimização de performance
2. Testes automatizados
3. Melhorias de acessibilidade
4. Documentação de API

### Médio Prazo
1. App mobile (React Native)
2. Notificações push
3. Sincronização com calendários
4. Sistema de avaliações

### Longo Prazo
1. Marketplace de plantões
2. Integração com sistemas de RH
3. Analytics avançados
4. Comunidade de profissionais

---

## 📝 Notas Técnicas

### Requisitos do Sistema
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Chaves OpenAI (para IA e OCR)

### Variáveis de Ambiente
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

### Scripts Disponíveis
- `npm run dev`: Servidor de desenvolvimento
- `npm run build`: Build de produção
- `npm run start`: Servidor de produção
- `npm run lint`: Linter

---

## 📞 Suporte

Para questões técnicas ou sugestões, consulte a documentação do código ou entre em contato com a equipe de desenvolvimento.

---

**Documento gerado automaticamente**  
**Última atualização**: Dezembro 2024


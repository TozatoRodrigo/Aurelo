# Fluxos e Funcionalidades por Tela - Aurelo

## 📱 Fluxo Principal de Navegação

```
Login → Onboarding → Dashboard (Home)
         ↓
    [Escala | Finanças | Trocas | Perfil | OCR]
```

---

## 🔐 1. Tela de Login (`/login`)

### Funcionalidades:
- ✅ Login com email e senha
- ✅ Criação de conta (signup)
- ✅ Validação de formulário
- ✅ Redirecionamento automático se já autenticado

### Fluxos:
- **Login bem-sucedido** → Redireciona para `/` (Home)
- **Criar conta** → Envia email de confirmação → Usuário confirma → Pode fazer login
- **Já autenticado** → Redireciona automaticamente para `/`

### Elementos Visuais:
- Logo Aurelo animado
- Card com glassmorphism
- Gradiente de fundo
- Animações de entrada

---

## 🎯 2. Onboarding (`/onboarding`)

### Funcionalidades:
- ✅ **Passo 1**: Preenchimento de perfil (nome completo, função)
- ✅ **Passo 2**: Adicionar vínculos de trabalho (instituição, tipo de contrato, valor/hora)
- ✅ Adicionar múltiplos vínculos
- ✅ Remover vínculos antes de finalizar
- ✅ Validação de formulários

### Fluxos:
- **Passo 1 → Passo 2**: Após preencher perfil
- **Passo 2 → Concluir**: Salva perfil e vínculos no Supabase
- **Concluir** → Redireciona para `/` (Home)

### Elementos Visuais:
- Stepper visual (2 passos)
- Cards de vínculos adicionados
- Animações de transição entre passos

---

## 🏠 3. Dashboard / Home (`/`)

### Funcionalidades:
- ✅ **Próximo Plantão**: Mostra o próximo plantão agendado
- ✅ **Ganhos Estimados**: Soma dos valores estimados dos plantões do mês
- ✅ **Widget de Burnout**: Cálculo de horas trabalhadas e risco
- ✅ **Escala da Semana**: Lista dos próximos 3 plantões
- ✅ **Botão "Novo Plantão"**: Abre modal para adicionar plantão
- ✅ **Aurelo AI Chat**: Botão flutuante para assistente IA

### Fluxos:
- **Ver todos os plantões** → Redireciona para `/escala`
- **Novo Plantão** → Abre modal → Preenche dados → Salva → Atualiza lista
- **Aurelo AI** → Abre chat flutuante → Perguntas sobre escala, ganhos, horas

### Elementos Visuais:
- Cards com gradientes (Primary, Accent)
- Widget de burnout com cores semânticas
- Lista de plantões com ShiftCard
- Botão flutuante do chat IA

---

## 📅 4. Escala (`/escala`)

### Funcionalidades:
- ✅ **Calendário Interativo**: Seleciona data para ver plantões
- ✅ **Bolhas Coloridas**: Dias com plantões marcados em azul
- ✅ **Filtro por Instituição**: Dropdown para filtrar por hospital/clínica
- ✅ **Lista de Plantões**: Mostra plantões do dia selecionado
- ✅ **Adicionar Plantão**: Botão no topo abre modal
- ✅ **Editar Plantão**: Botão de edição em cada ShiftCard
- ✅ **Excluir Plantão**: Botão de exclusão em cada ShiftCard

### Fluxos:
- **Selecionar data no calendário** → Filtra e mostra plantões daquele dia
- **Filtrar por instituição** → Mostra apenas plantões daquela instituição
- **Adicionar Plantão** → Modal → Preenche (instituição, horário, valor) → Salva → Atualiza calendário
- **Editar Plantão** → Modal pré-preenchido → Altera dados → Salva → Atualiza
- **Excluir Plantão** → Confirma → Remove → Atualiza lista

### Elementos Visuais:
- Calendário com bolhas azuis nos dias com plantões
- Cards de plantões com borda colorida (por instituição)
- Filtro dropdown estilizado
- Indicador de quantos dias têm plantões

---

## 💰 5. Finanças (`/financas`)

### Funcionalidades:
- ✅ **Ganhos do Mês**: Card principal com total em R$
- ✅ **Filtro por Mês**: Dropdown para selecionar mês/ano
- ✅ **Gráfico de Barras**: Distribuição de ganhos por instituição
- ✅ **Gráfico de Pizza**: Distribuição percentual por instituição
- ✅ **Extrato Detalhado**: 
  - Resumo por instituição (cards coloridos)
  - Histórico completo de plantões (lista ordenada por data)
- ✅ **Exportar PDF**: Botão mock (funcionalidade futura)

### Fluxos:
- **Selecionar mês** → Carrega dados do mês selecionado → Atualiza gráficos e extrato
- **Ver histórico** → Scroll na lista de plantões → Ordenado por data (mais recente primeiro)

### Elementos Visuais:
- Card principal com gradiente azul
- Gráficos com cores da marca Aurelo
- Cards de resumo por instituição com cores diferentes
- Lista de plantões com animações de entrada

---

## 🔄 6. Troca de Plantão (`/trocas`)

### Funcionalidades:
- ✅ **Anunciar Plantão**: Botão no card superior abre modal
- ✅ **Lista de Oportunidades**: Cards com ofertas e trocas disponíveis
- ✅ **Filtro por Tipo**: Dropdown (Todos / Ofertas / Trocas)
- ✅ **Tenho Interesse**: Botão em cada oportunidade (mock)

### Fluxos:
- **Anunciar Plantão** → Modal → Preenche (instituição, data, horário, tipo) → Confirma → Toast de sucesso
- **Filtrar por tipo** → Mostra apenas ofertas ou trocas
- **Tenho Interesse** → Toast de confirmação (mock)

### Elementos Visuais:
- Card superior com gradiente e botão de anunciar
- Cards de oportunidades com avatar, badge de tipo, informações do plantão
- Filtro dropdown
- Badges coloridos (Oferta/Troca)

---

## 👤 7. Perfil (`/perfil`)

### Funcionalidades:
- ✅ **Visualizar Perfil**: Avatar, nome, função
- ✅ **Editar Perfil**: Botão de edição abre modal
- ✅ **Meus Vínculos** (Aba 1):
  - Lista de vínculos cadastrados
  - Editar vínculo (modal pré-preenchido)
  - Excluir vínculo (com confirmação)
  - Adicionar novo vínculo
- ✅ **Preferências** (Aba 2):
  - Meta financeira mensal (R$)
  - Limite de horas semanais
  - Salvar preferências
- ✅ **Logout**: Botão no topo

### Fluxos:
- **Editar Perfil** → Modal → Altera nome/função → Salva → Atualiza card
- **Adicionar Vínculo** → Modal → Preenche dados → Salva → Adiciona à lista
- **Editar Vínculo** → Modal pré-preenchido → Altera → Salva → Atualiza lista
- **Excluir Vínculo** → Confirma → Remove → Atualiza lista
- **Salvar Preferências** → Atualiza meta e limite → Salva no Supabase
- **Logout** → Desautentica → Redireciona para `/login`

### Elementos Visuais:
- Card de perfil com avatar grande e anel de status
- Abas com indicador deslizante
- Cards de vínculos com badges de tipo de contrato
- Formulários com inputs transparentes

---

## 📸 8. OCR / Importar Escala (`/ocr`)

### Funcionalidades:
- ✅ **Upload de Arquivo**: Suporta imagem (JPG, PNG) e PDF
- ✅ **Processamento com IA**: Botão processa o arquivo
- ✅ **Lista de Plantões Identificados**: Mostra dados extraídos
- ✅ **Edição Inline**: Editar data, horários, vínculo, valor antes de confirmar
- ✅ **Remover Plantão**: Botão X para remover da lista
- ✅ **Confirmar Importação**: Adiciona todos os plantões ao banco

### Fluxos:
- **Upload** → Seleciona arquivo → Clica "Processar" → IA extrai dados → Mostra lista
- **Editar Plantão** → Clica lápis → Edita campos → Salva edição
- **Remover Plantão** → Clica X → Remove da lista
- **Confirmar Importação** → Adiciona todos à escala → Redireciona para `/escala`

### Elementos Visuais:
- Área de upload com borda tracejada animada
- Cards de plantões identificados com botões de edição
- Formulários inline para edição
- Alerta amarelo para revisar dados

---

## 🤖 9. Aurelo AI Chat (Widget Flutuante)

### Funcionalidades:
- ✅ **Abrir/Fechar Chat**: Botão flutuante no canto inferior direito
- ✅ **Conversação**: Perguntas e respostas sobre:
  - Ganhos e receitas
  - Plantões agendados
  - Carga de trabalho (horas)
  - Risco de burnout
  - Estatísticas da escala
- ✅ **Contexto Inteligente**: Usa dados reais dos plantões do usuário

### Fluxos:
- **Abrir Chat** → Expande widget → Mostra histórico de mensagens
- **Enviar Mensagem** → Processa com lógica mock → Retorna resposta contextual
- **Fechar Chat** → Minimiza widget → Mantém histórico

### Elementos Visuais:
- Botão flutuante com pulso animado
- Widget com header azul e ícone Sparkles
- Mensagens com bolhas (usuário à direita, assistente à esquerda)
- Input com botão de enviar

---

## 🧭 10. Navegação Mobile (`MobileNav`)

### Funcionalidades:
- ✅ **Barra Inferior Fixa**: 5 ícones principais
- ✅ **Indicador Ativo**: Bolha animada sob o ícone da página atual
- ✅ **Ícones**: Início, Escala, Trocas, Finanças, Perfil

### Fluxos:
- **Clicar em ícone** → Navega para a rota → Atualiza indicador visual

### Elementos Visuais:
- Barra com glassmorphism e backdrop-blur
- Ícones com peso de linha maior quando ativo
- Bolha animada com spring physics

---

## 🔒 11. Middleware de Autenticação

### Funcionalidades:
- ✅ **Proteção de Rotas**: Redireciona não autenticados para `/login`
- ✅ **Redirecionamento de Auth**: Se autenticado, redireciona de `/login` e `/onboarding` para `/`

### Fluxos:
- **Acessar rota protegida sem login** → Redireciona para `/login`
- **Acessar `/login` autenticado** → Redireciona para `/`

---

## 📊 Resumo de Funcionalidades por Módulo

| Módulo | CRUD | Filtros | Visualizações | Integrações |
|--------|------|---------|---------------|-------------|
| **Login** | - | - | - | Supabase Auth |
| **Onboarding** | Create (Perfil, Vínculos) | - | Stepper | Supabase |
| **Home** | Create (Plantão via modal) | - | Cards, Widgets | Supabase, Zustand |
| **Escala** | Create, Read, Update, Delete | Por data, Por instituição | Calendário, Lista | Supabase, Zustand |
| **Finanças** | Read | Por mês | Gráficos, Extrato | Supabase, Zustand, Recharts |
| **Trocas** | Create (Anúncio) | Por tipo | Lista de cards | Mock (futuro: Supabase) |
| **Perfil** | Read, Update, Delete | - | Abas, Formulários | Supabase |
| **OCR** | Create (via importação) | - | Lista editável | Supabase, OCR API (mock) |
| **AI Chat** | - | - | Conversação | Mock (futuro: OpenAI) |

---

## 🎨 Padrões Visuais Aplicados

- ✅ **Liquid UI**: Bordas arredondadas (16-28px), sombras suaves
- ✅ **Glassmorphism**: Backdrop-blur em cards e modais
- ✅ **Gradientes**: Uso de cores Aurelo em backgrounds
- ✅ **Animações**: Framer Motion em transições e microinterações
- ✅ **Cores Semânticas**: Verde (baixo risco), Amarelo (médio), Vermelho (alto)
- ✅ **Tipografia**: Inter como fonte principal
- ✅ **Espaçamento**: Consistente com tokens do design system

---

## 🚀 Próximos Passos Sugeridos

1. **Integração Real de OCR**: Conectar com Google Vision API ou OpenAI Vision
2. **Sistema de Trocas Real**: Backend para matching de plantões
3. **Notificações**: Push notifications para lembretes e oportunidades
4. **Relatórios Avançados**: Exportação PDF real, gráficos mais detalhados
5. **Integração OpenAI**: Chat IA com contexto real dos dados do usuário
6. **Modo Offline**: PWA com sincronização quando online


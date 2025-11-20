# 🗺️ Diagrama de Fluxos - Aurelo

## Fluxo Principal de Autenticação

```
┌─────────────┐
│   Login     │
│  /login     │
└──────┬──────┘
       │
       ├─ Login OK ──┐
       │              │
       └─ Criar Conta │
                      │
                 ┌────▼─────┐
                 │Onboarding │
                 │/onboarding│
                 └────┬──────┘
                      │
                      │ Concluir
                      │
                 ┌────▼──────┐
                 │  Home     │
                 │    /      │
                 └───────────┘
```

## Navegação Principal (Home)

```
         ┌─────────┐
         │  Home   │
         │    /    │
         └────┬────┘
              │
    ┌─────────┼─────────┬─────────┬─────────┐
    │         │         │         │         │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Escala │ │Finan.│ │Trocas │ │Perfil │ │  OCR  │
│/escala│ │/finan│ │/trocas│ │/perfil│ │ /ocr  │
└───────┘ └──────┘ └───────┘ └───────┘ └───────┘
```

## Fluxo: Adicionar Plantão

```
Home (/)
  │
  ├─ Clica "Novo Plantão"
  │
  ▼
┌─────────────────────┐
│ Modal: Novo Plantão  │
│ - Seleciona Instituição
│ - Define Horário
│ - Valor (opcional)   │
└──────┬──────────────┘
       │
       ├─ Salva ──┐
       │          │
       └─ Cancela │
                  │
            ┌─────▼─────┐
            │ Atualiza   │
            │ Lista      │
            └────────────┘
```

## Fluxo: Visualizar Escala

```
Escala (/escala)
  │
  ├─ Seleciona Data no Calendário
  │
  ▼
┌─────────────────────┐
│ Lista de Plantões    │
│ do Dia Selecionado   │
└──────┬──────────────┘
       │
       ├─ Editar ──┐
       │            │
       ├─ Excluir ──┤
       │            │
       └─ Filtrar ──┤
                    │
              ┌─────▼─────┐
              │ Atualiza   │
              │ Visualização│
              └────────────┘
```

## Fluxo: Importar Escala (OCR)

```
OCR (/ocr)
  │
  ├─ Upload de Imagem/PDF
  │
  ▼
┌─────────────────────┐
│ Processamento IA     │
│ (Extrai Plantões)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Lista de Plantões    │
│ Identificados        │
│                      │
│ [Editar] [Remover]   │
└──────┬──────────────┘
       │
       ├─ Confirmar Importação
       │
       ▼
┌─────────────────────┐
│ Redireciona para    │
│ /escala             │
└─────────────────────┘
```

## Fluxo: Gerenciar Perfil

```
Perfil (/perfil)
  │
  ├─ Aba: Meus Vínculos
  │   │
  │   ├─ Adicionar Vínculo ──┐
  │   │                       │
  │   ├─ Editar Vínculo ─────┤
  │   │                       │
  │   └─ Excluir Vínculo ─────┤
  │                           │
  ├─ Aba: Preferências        │
  │   │                       │
  │   └─ Salvar Meta/Limite ──┤
  │                           │
  └─ Editar Perfil ───────────┤
                              │
                        ┌─────▼─────┐
                        │ Atualiza   │
                        │ Dados      │
                        └────────────┘
```

## Fluxo: Visualizar Finanças

```
Finanças (/financas)
  │
  ├─ Seleciona Mês
  │
  ▼
┌─────────────────────┐
│ Carrega Dados        │
│ do Mês               │
└──────┬──────────────┘
       │
       ├─ Card: Total do Mês
       │
       ├─ Gráfico de Barras (Por Instituição)
       │
       ├─ Gráfico de Pizza (Distribuição)
       │
       └─ Extrato Detalhado
           │
           ├─ Resumo por Instituição
           │
           └─ Histórico de Plantões
```

## Fluxo: Troca de Plantão

```
Trocas (/trocas)
  │
  ├─ Anunciar Plantão
  │   │
  │   └─ Modal ──┐
  │               │
  ├─ Filtrar Tipo │
  │   │           │
  │   └─ Todos/   │
  │      Ofertas/ │
  │      Trocas   │
  │               │
  └─ Lista de     │
      Oportunidades│
                  │
            ┌─────▼─────┐
            │ Mostra     │
            │ Cards      │
            └────────────┘
```

## Fluxo: Chat IA

```
Home (/)
  │
  ├─ Clica Botão Flutuante (Chat)
  │
  ▼
┌─────────────────────┐
│ Widget de Chat       │
│ Abre                 │
└──────┬──────────────┘
       │
       ├─ Pergunta sobre:
       │   - Ganhos
       │   - Plantões
       │   - Horas
       │   - Burnout
       │
       ▼
┌─────────────────────┐
│ Resposta Contextual  │
│ (Usa dados reais)    │
└─────────────────────┘
```

## Checklist de Funcionalidades por Tela

### ✅ Login (`/login`)
- [x] Formulário de login
- [x] Criar conta
- [x] Validação
- [x] Redirecionamento

### ✅ Onboarding (`/onboarding`)
- [x] Passo 1: Perfil
- [x] Passo 2: Vínculos
- [x] Adicionar múltiplos vínculos
- [x] Remover vínculos
- [x] Finalizar

### ✅ Home (`/`)
- [x] Próximo plantão
- [x] Ganhos estimados
- [x] Widget burnout
- [x] Lista de plantões da semana
- [x] Botão novo plantão
- [x] Chat IA flutuante

### ✅ Escala (`/escala`)
- [x] Calendário interativo
- [x] Bolhas nos dias com plantões
- [x] Filtro por instituição
- [x] Lista de plantões do dia
- [x] Adicionar plantão
- [x] Editar plantão
- [x] Excluir plantão

### ✅ Finanças (`/financas`)
- [x] Total do mês
- [x] Filtro por mês
- [x] Gráfico de barras
- [x] Gráfico de pizza
- [x] Resumo por instituição
- [x] Histórico detalhado
- [x] Botão exportar (mock)

### ✅ Trocas (`/trocas`)
- [x] Anunciar plantão
- [x] Lista de oportunidades
- [x] Filtro por tipo
- [x] Botão "Tenho Interesse" (mock)

### ✅ Perfil (`/perfil`)
- [x] Visualizar perfil
- [x] Editar perfil
- [x] Listar vínculos
- [x] Adicionar vínculo
- [x] Editar vínculo
- [x] Excluir vínculo
- [x] Preferências (meta, limite)
- [x] Logout

### ✅ OCR (`/ocr`)
- [x] Upload de arquivo
- [x] Processamento IA
- [x] Lista de plantões identificados
- [x] Edição inline
- [x] Remover plantão
- [x] Confirmar importação

### ✅ Chat IA (Widget)
- [x] Abrir/fechar
- [x] Conversação
- [x] Respostas contextuais
- [x] Histórico de mensagens


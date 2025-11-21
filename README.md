# 🏥 Aurelo - Assistente de Gestão de Escalas para Profissionais da Saúde

![Aurelo Logo](public/aurelo-logo.png)

> Plataforma digital inteligente para gerenciar escalas de trabalho, otimizar ganhos e facilitar trocas de plantões entre profissionais da área da saúde.

## 📋 Sobre o Projeto

Aurelo é uma aplicação web desenvolvida para profissionais da saúde (enfermeiros, técnicos, auxiliares) que trabalham em múltiplas instituições. A plataforma centraliza a gestão de escalas, oferece insights financeiros, previne burnout e facilita a troca de plantões entre colegas através de uma rede social profissional privada.

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Onboarding
- Login e cadastro seguro via Supabase Auth
- Onboarding em 2 passos (perfil + vínculos de trabalho)
- Suporte a múltiplos vínculos (CLT, PJ, Informal)

### 📅 Gestão de Escalas
- Calendário interativo com visualização mensal
- CRUD completo de plantões
- Filtros por data e instituição
- Suporte a plantões noturnos
- Indicadores visuais nos dias com plantões

### 💰 Gestão Financeira
- Dashboard com gráficos (barras e pizza)
- Filtros por período (mês/ano)
- Resumo por instituição
- Extrato detalhado
- Exportação em PDF

### 🔄 Sistema de Trocas
- Três tipos de anúncio: Oferta, Solicitação, Troca
- Sistema de interesses e aceitação
- Atualização automática de escalas
- Filtro de privacidade (apenas amigos)

### 👥 Sistema de Amigos
- Adicionar amigos por busca, email ou código Aurelo
- Código único por usuário
- Gerenciamento de solicitações
- Rede privada para trocas seguras

### 🤖 Assistente IA
- Chat contextual com GPT-4o
- Respostas sobre escalas, ganhos e horas trabalhadas
- Histórico de conversas persistido

### 📸 OCR de Escalas
- Upload de imagens de escalas
- Processamento com OpenAI Vision API
- Extração automática de plantões
- Edição e confirmação antes de salvar

### 🔔 Notificações
- Sistema completo de notificações
- Badge de não lidas
- Notificações automáticas (lembretes, interesses, alertas)

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Estilização**: Tailwind CSS v4
- **Animações**: Framer Motion
- **Componentes**: Shadcn/ui (Radix UI)
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **PDF**: jsPDF + jspdf-autotable

### Backend
- **BaaS**: Supabase
  - Autenticação
  - PostgreSQL com Row Level Security
  - Storage
- **Server Actions**: Next.js Server Actions

### Integrações
- **OpenAI**: GPT-4o (chat) + GPT-4 Vision (OCR)

### Estado Global
- **Zustand**: Gerenciamento de estado com persistência

## 🚀 Como Executar

### 🌐 Deploy em Produção (Vercel) - Recomendado

O projeto está configurado para deploy automático na Vercel!

**Deploy em 5 minutos:**
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte o repositório **TozatoRodrigo/Aurelo**
3. Adicione as variáveis de ambiente (veja [GUIA_DEPLOY_RAPIDO.md](GUIA_DEPLOY_RAPIDO.md))
4. Clique em Deploy!

**Deploy automático:** Todos os pushes para `main` fazem deploy automaticamente!

📖 **Guia completo**: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)  
⚡ **Guia rápido**: [GUIA_DEPLOY_RAPIDO.md](GUIA_DEPLOY_RAPIDO.md)

### 💻 Desenvolvimento Local

#### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Chaves OpenAI (para IA e OCR)

#### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/TozatoRodrigo/Aurelo.git
cd Aurelo
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
OPENAI_API_KEY=sua_chave_openai
```

4. Execute as migrações do banco de dados:
```bash
# Execute os arquivos SQL em supabase/migrations/ na ordem numérica
# No Supabase Dashboard > SQL Editor
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse a aplicação:
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
Aurelo/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── actions/      # Server Actions
│   │   ├── amigos/       # Página de Amigos
│   │   ├── escala/       # Página de Escala
│   │   ├── financas/     # Página de Finanças
│   │   ├── login/        # Página de Login
│   │   ├── ocr/          # Página de OCR
│   │   ├── onboarding/   # Página de Onboarding
│   │   ├── perfil/       # Página de Perfil
│   │   └── trocas/       # Página de Trocas
│   ├── components/       # Componentes React
│   │   ├── features/     # Componentes de funcionalidades
│   │   ├── layout/       # Componentes de layout
│   │   └── ui/           # Componentes UI base
│   ├── lib/              # Bibliotecas e utilitários
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # Migrações do banco de dados
├── public/               # Arquivos estáticos
└── scripts/              # Scripts utilitários
```

## 🎨 Design System

O projeto utiliza o **Design System "Liquid UI"** com:
- Glassmorphism (efeito de vidro fosco)
- Bordas arredondadas
- Sombras suaves
- Cores pastéis
- Animações fluidas

## 🔒 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Isolamento de dados por usuário
- ✅ Validação client-side e server-side
- ✅ Autenticação segura via Supabase Auth
- ✅ Sistema de amigos para privacidade nas trocas

## 📚 Documentação

- [Documentação Completa](DOCUMENTACAO_COMPLETA_AURELO.md)
- [Fluxos e Funcionalidades](FLUXOS_E_FUNCIONALIDADES.md)
- [Diagrama de Fluxos](DIAGRAMA_FLUXOS.md)
- [Comandos do Servidor](COMANDOS_SERVIDOR.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📝 Licença

Este projeto é privado e proprietário.

## 👤 Autor

**Rodrigo Tozato**
- GitHub: [@TozatoRodrigo](https://github.com/TozatoRodrigo)

## 🙏 Agradecimentos

- Supabase pela infraestrutura
- OpenAI pelas APIs de IA
- Comunidade open source pelos componentes e bibliotecas

---

**Desenvolvido com ❤️ para profissionais da saúde**

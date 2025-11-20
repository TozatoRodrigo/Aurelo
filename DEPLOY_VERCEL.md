# 🚀 Guia de Deploy na Vercel

Este guia explica como fazer o deploy automático do Aurelo na Vercel.

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Repositório no GitHub (já configurado)
3. Credenciais do Supabase
4. Chave da API OpenAI

## 🔧 Método 1: Deploy Automático via GitHub (Recomendado)

### Passo 1: Conectar Repositório na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Selecione o repositório **TozatoRodrigo/Aurelo**
4. Clique em **"Import"**

### Passo 2: Configurar Variáveis de Ambiente

Na tela de configuração do projeto, adicione as seguintes variáveis de ambiente:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
OPENAI_API_KEY=sua_chave_da_openai
```

**Como encontrar:**
- **Supabase URL e Key**: Dashboard do Supabase > Settings > API
- **OpenAI Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Passo 3: Configurar Build

A Vercel detecta automaticamente Next.js, mas verifique:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Acesse a URL fornecida pela Vercel

### Passo 5: Configurar Deploy Automático

Após o primeiro deploy, todos os pushes para a branch `main` irão:
- ✅ Fazer deploy automaticamente
- ✅ Criar previews para Pull Requests
- ✅ Notificar por email sobre o status

## 🔧 Método 2: Deploy via CLI

### Instalação da CLI

```bash
npm i -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# Deploy de produção
vercel --prod

# Ou apenas vercel para preview
vercel
```

### Configurar Variáveis de Ambiente via CLI

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY
```

## 🔐 Variáveis de Ambiente

### Obrigatórias

| Variável | Descrição | Onde Encontrar |
|----------|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase | Supabase Dashboard > Settings > API |
| `OPENAI_API_KEY` | Chave da API OpenAI | platform.openai.com/api-keys |

### Opcionais

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (apenas se necessário) |

## 📝 Configurações Adicionais

### Domínio Customizado

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure os DNS conforme instruções

### Ambiente de Produção vs Preview

- **Production**: Deploys da branch `main`
- **Preview**: Deploys de outras branches e PRs

Você pode configurar variáveis diferentes para cada ambiente em **Settings** > **Environment Variables**.

## 🔄 Deploy Automático

Após conectar o GitHub, o deploy automático está ativo:

- ✅ **Push para `main`** → Deploy de produção
- ✅ **Pull Request** → Preview deployment
- ✅ **Outras branches** → Preview deployment

## 🐛 Troubleshooting

### Erro de Build

1. Verifique os logs na Vercel
2. Certifique-se de que todas as variáveis de ambiente estão configuradas
3. Verifique se o Node.js version está correto (18+)

### Erro de Variáveis de Ambiente

1. Verifique se todas as variáveis estão configuradas
2. Certifique-se de que não há espaços extras
3. Refaça o deploy após adicionar variáveis

### Erro de Banco de Dados

1. Verifique se as migrações foram executadas no Supabase
2. Verifique as políticas RLS
3. Teste a conexão localmente primeiro

## 📊 Monitoramento

Após o deploy, você pode:
- Ver logs em tempo real
- Monitorar performance
- Ver analytics de uso
- Configurar alertas

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variáveis de Ambiente](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Pronto!** Seu projeto estará em produção automaticamente após cada push para `main`.


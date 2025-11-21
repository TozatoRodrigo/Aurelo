# 🔧 Configurar Variáveis de Ambiente

## ⚠️ Erro: Variáveis de Ambiente Não Configuradas

Se você está vendo o erro:
```
@supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

Isso significa que as variáveis de ambiente do Supabase não estão configuradas.

## 🚀 Configuração Rápida

### Para Desenvolvimento Local

1. **Crie o arquivo `.env.local` na raiz do projeto:**

```bash
# Na raiz do projeto GestaoEscala/
touch .env.local
```

2. **Adicione as variáveis de ambiente:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# OpenAI Configuration (opcional, apenas se usar IA/OCR)
OPENAI_API_KEY=sua_chave_openai_aqui
```

3. **Onde encontrar as credenciais do Supabase:**

   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **Settings** > **API**
   - Copie:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Reinicie o servidor de desenvolvimento:**

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

### Para Produção na Vercel

1. **Acesse o Dashboard da Vercel:**
   - https://vercel.com/dashboard

2. **Selecione seu projeto** (Aurelo)

3. **Vá em Settings > Environment Variables**

4. **Adicione as variáveis:**

   | Nome | Valor | Ambiente |
   |------|-------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua_chave_anon` | Production, Preview, Development |
   | `OPENAI_API_KEY` | `sua_chave_openai` | Production, Preview, Development |

5. **Importante:**
   - ✅ Marque todas as opções (Production, Preview, Development)
   - ✅ Não adicione espaços no início ou fim dos valores
   - ✅ A URL deve começar com `https://`

6. **Após adicionar as variáveis:**
   - Faça um novo deploy (ou aguarde o deploy automático)
   - As variáveis serão aplicadas no próximo deploy

## 🔍 Verificar se Está Funcionando

### Localmente

1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se as variáveis estão corretas (sem espaços extras)
3. Reinicie o servidor (`npm run dev`)
4. Abra o console do navegador e verifique se não há erros

### Na Vercel

1. Vá em **Deployments** no dashboard da Vercel
2. Clique no último deployment
3. Verifique os **Build Logs** para ver se há erros
4. Se houver erro de variáveis, verifique se estão configuradas corretamente

## 📝 Exemplo de Arquivo .env.local

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzNDU2NywiZXhwIjoxOTYwODEwNTY3fQ.exemplo

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-exemplo123456789
```

## ⚠️ Importante

- ❌ **NUNCA** commite o arquivo `.env.local` no Git
- ✅ O arquivo `.env.local` já está no `.gitignore`
- ✅ Use `.env.example` como referência (sem valores reais)
- ✅ Na Vercel, as variáveis são seguras e não aparecem no código

## 🆘 Ainda com Problemas?

1. Verifique se não há espaços extras nas variáveis
2. Verifique se a URL começa com `https://`
3. Reinicie o servidor após criar/editar `.env.local`
4. Na Vercel, faça um novo deploy após adicionar variáveis
5. Verifique os logs de build na Vercel para mais detalhes

---

**Última atualização:** Após correção de validação de variáveis de ambiente


# ⚡ Deploy Rápido na Vercel - 5 Minutos

## 🚀 Passo a Passo

### 1. Acesse a Vercel
👉 [vercel.com/new](https://vercel.com/new)

### 2. Conecte o GitHub
- Clique em **"Import Git Repository"**
- Autorize a Vercel a acessar seu GitHub
- Selecione **TozatoRodrigo/Aurelo**

### 3. Configure o Projeto
- **Framework Preset**: Next.js (detectado automaticamente)
- **Root Directory**: `./` (raiz)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)

### 4. Adicione Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL = sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua_chave_anon_do_supabase  
OPENAI_API_KEY = sua_chave_da_openai
```

**Onde encontrar:**
- **Supabase**: Dashboard > Settings > API
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 5. Deploy!
- Clique em **"Deploy"**
- Aguarde 2-5 minutos
- ✅ Pronto! Seu app está no ar!

## 🔄 Deploy Automático

Após o primeiro deploy, **todos os pushes para `main`** farão deploy automático!

## 📝 Checklist Pós-Deploy

- [ ] Testar login/cadastro
- [ ] Verificar conexão com Supabase
- [ ] Testar funcionalidades principais
- [ ] Configurar domínio customizado (opcional)

## 🆘 Problemas?

Veja o guia completo: [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)


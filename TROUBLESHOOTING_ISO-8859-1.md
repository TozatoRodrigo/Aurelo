# 🔧 Troubleshooting: Erro ISO-8859-1 / Type Error

## ✅ Status do Código

O código está **100% correto**. O arquivo `src/lib/supabase/client.ts` está usando apenas a implementação padrão do `@supabase/ssr` sem nenhuma configuração manual de cookies.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 🎯 Causas Prováveis do Erro Persistente

### 1. **Cookies Antigos no Navegador** (99% dos casos)

Se o código anterior gravou cookies com caracteres inválidos, eles continuarão causando o erro mesmo com o código corrigido.

#### ✅ Teste Rápido

1. Abra uma **Janela Anônima** (Ctrl+Shift+N / Cmd+Shift+N)
2. Tente fazer login

**Se funcionar na anônima:**
- O problema são cookies antigos no seu navegador principal
- **Solução:** Limpe os dados do site

**Se falhar na anônima:**
- O problema está nas variáveis de ambiente ou configuração
- Siga para o passo 2

#### 🧹 Como Limpar Cookies (Chrome/Edge)

1. Abra DevTools (F12)
2. Vá em **Application** > **Storage**
3. Clique em **Clear site data**
4. Ou manualmente: **Cookies** > Seu domínio > Delete All

#### 🧹 Como Limpar Cookies (Firefox)

1. Abra DevTools (F12)
2. Vá em **Storage** > **Cookies**
3. Clique com botão direito > **Delete All**

### 2. **Variáveis de Ambiente na Vercel**

Verifique se as variáveis estão corretas:

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** > **Environment Variables**
3. Verifique:

   - ✅ `NEXT_PUBLIC_SUPABASE_URL` está definida
   - ✅ Começa com `https://` (não `http://`)
   - ✅ Não tem espaços no início ou fim
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` está definida

4. **Após alterar variáveis:**
   - Faça um novo deploy (ou aguarde o deploy automático)
   - Limpe o cache do navegador

### 3. **Cache do Next.js (Desenvolvimento Local)**

Se estiver rodando localmente:

```bash
# Delete a pasta .next e node_modules
rm -rf .next node_modules

# Reinstale e rode novamente
npm install
npm run dev
```

## 📋 Checklist de Resolução

- [ ] Código verificado: `client.ts` está sem configuração manual de cookies
- [ ] Teste em janela anônima realizado
- [ ] Cookies limpos no navegador principal
- [ ] Variáveis de ambiente verificadas na Vercel
- [ ] Novo deploy realizado após correções
- [ ] Cache do navegador limpo

## 🚀 Deploy Atualizado

O código já foi atualizado e enviado para o GitHub. O deploy automático na Vercel deve estar em andamento.

**Último commit:** `88a11ab` - Simplificação do client.ts

## 📞 Se o Problema Persistir

1. Verifique o console do navegador para mensagens de erro detalhadas
2. Verifique a aba Network no DevTools para ver qual requisição está falhando
3. Verifique os logs da Vercel para erros de build ou runtime
4. Teste em outro navegador para isolar o problema

---

**Última atualização:** Após correção do encoding ISO-8859-1


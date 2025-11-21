import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Removemos a configuração manual de cookies.
  // O createBrowserClient do @supabase/ssr já usa document.cookie automaticamente
  // e lida corretamente com a codificação/decodificação segura.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

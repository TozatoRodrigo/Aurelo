import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // NENHUMA opção extra deve ser passada aqui.
  // O createBrowserClient já sabe lidar com cookies do navegador nativamente.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

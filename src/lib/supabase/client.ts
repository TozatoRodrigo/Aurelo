import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique se NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão definidas. ' +
      'Para desenvolvimento local, crie um arquivo .env.local com essas variáveis. ' +
      'Para produção na Vercel, configure em Settings > Environment Variables.'
    )
  }

  // NENHUMA opção extra deve ser passada aqui.
  // O createBrowserClient já sabe lidar com cookies do navegador nativamente.
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

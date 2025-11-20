import { createBrowserClient } from '@supabase/ssr'

// REMOVIDO: Polyfill global do fetch que estava causando problemas
// O polyfill estava interceptando requisições do Supabase e outras APIs,
// causando erros "Failed to read headers property" quando headers continham
// caracteres não-ISO-8859-1 (que são válidos em tokens JWT e outras APIs modernas).
//
// Se sanitização de headers for necessária em pontos específicos,
// deve ser feita apenas nesses pontos, não globalmente.
//
// O @supabase/ssr já gerencia cookies e headers corretamente.

export function createClient() {
  // Usar implementação padrão do @supabase/ssr sem customizações
  // O @supabase/ssr já gerencia cookies corretamente com Base64-URL encoding
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

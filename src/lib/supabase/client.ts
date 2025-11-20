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
  // 
  // IMPORTANTE: Se o erro de ISO-8859-1 persistir, pode ser necessário
  // verificar se há cookies ou tokens com caracteres inválidos sendo passados
  // nos headers. Nesse caso, limpar cookies do navegador pode ajudar.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Opções adicionais para garantir compatibilidade
      // O @supabase/ssr já usa Base64-URL encoding por padrão para cookies
      cookies: {
        getAll() {
          // Usar implementação padrão do @supabase/ssr
          // Ela já lida corretamente com encoding
          if (typeof document === 'undefined') return []
          return document.cookie.split('; ').map(cookie => {
            const [name, ...rest] = cookie.split('=')
            return {
              name: decodeURIComponent(name || ''),
              value: decodeURIComponent(rest.join('=') || '')
            }
          }).filter(c => c.name && c.value)
        },
        setAll(cookiesToSet) {
          // Usar implementação padrão do @supabase/ssr
          // Ela já lida corretamente com encoding
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              const encodedName = encodeURIComponent(name)
              const encodedValue = encodeURIComponent(value)
              let cookieString = `${encodedName}=${encodedValue}`
              
              if (options) {
                if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`
                if (options.domain) cookieString += `; Domain=${options.domain}`
                if (options.path) cookieString += `; Path=${options.path || '/'}`
                if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`
                if (options.secure) cookieString += `; Secure`
                if (options.httpOnly) cookieString += `; HttpOnly`
              }
              
              document.cookie = cookieString
            } catch (error) {
              console.warn('Failed to set cookie:', name, error)
            }
          })
        }
      }
    }
  )
}

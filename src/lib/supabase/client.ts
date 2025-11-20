import { createBrowserClient } from '@supabase/ssr'

// Polyfill fetch to sanitize headers globally (only on client side)
// IMPORTANT: This should NOT sanitize Supabase auth requests/headers
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // PRIMEIRO: Detectar URL da requisição ANTES de qualquer outra operação
    let requestUrl = ''
    let isSupabaseRequest = false
    
    try {
      // Extrair URL de forma segura
      if (typeof input === 'string') {
        requestUrl = input
      } else if (input instanceof URL) {
        requestUrl = input.href
      } else if (input && typeof input === 'object' && 'url' in input) {
        // É um objeto Request - acessar URL diretamente
        requestUrl = (input as Request).url
      }
      
      // Verificar se é requisição do Supabase ANTES de qualquer outra operação
      isSupabaseRequest = requestUrl.includes('supabase.co') || 
                         requestUrl.includes('supabase') ||
                         (supabaseUrl !== '' && requestUrl.includes(supabaseUrl))
    } catch (error) {
      // Se não conseguir detectar URL, usar fetch original (mais seguro)
      return originalFetch(input, init)
    }
    
    // SEGUNDO: Se for Supabase, usar fetch original IMEDIATAMENTE
    // Isso deve acontecer ANTES de qualquer tentativa de acessar headers
    if (isSupabaseRequest) {
      return originalFetch(input, init)
    }
    
    // TERCEIRO: Verificar se tem init e headers
    if (!init || !init.headers) {
      return originalFetch(input, init)
    }

    // QUARTO: Tentar sanitizar headers de forma MUITO defensiva
    // Se houver QUALQUER erro ao acessar headers, usar fetch original
    try {
      // Tentar verificar se podemos acessar headers sem causar erro
      // Se init.headers for um objeto Headers, tentar criar uma cópia segura
      let headersObj: Record<string, string> | null = null
      
      if (init.headers instanceof Headers) {
        // Para Headers, tentar acessar de forma segura
        try {
          // Criar um novo objeto Headers para testar se podemos acessar
          const testHeaders = new Headers(init.headers)
          headersObj = {}
          
          // Tentar iterar de forma segura
          testHeaders.forEach((value, key) => {
            try {
              // Sanitize: remove non-ISO-8859-1 characters
              const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              const sanitizedValue = Array.from(value).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              if (sanitizedKey && sanitizedValue) {
                headersObj![sanitizedKey] = sanitizedValue
              }
            } catch (e) {
              // Ignorar header individual que falhou
            }
          })
        } catch (e) {
          // Se falhar ao acessar Headers, usar fetch original
          return originalFetch(input, init)
        }
      } else if (Array.isArray(init.headers)) {
        headersObj = {}
        init.headers.forEach(([key, value]) => {
          try {
            const sanitizedKey = Array.from(String(key)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
            const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
            if (sanitizedKey && sanitizedValue) {
              headersObj![sanitizedKey] = sanitizedValue
            }
          } catch (e) {
            // Ignorar header que falhou
          }
        })
      } else if (typeof init.headers === 'object' && init.headers !== null) {
        headersObj = {}
        try {
          Object.entries(init.headers).forEach(([key, value]) => {
            try {
              const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              if (sanitizedKey && sanitizedValue) {
                headersObj![sanitizedKey] = sanitizedValue
              }
            } catch (e) {
              // Ignorar header que falhou
            }
          })
        } catch (e) {
          // Se falhar ao processar, usar fetch original
          return originalFetch(input, init)
        }
      }

      // Se não conseguiu criar headers sanitizados, usar fetch original
      if (!headersObj || Object.keys(headersObj).length === 0) {
        return originalFetch(input, init)
      }

      // Criar novo init com headers sanitizados
      const sanitizedInit: RequestInit = {
        ...init,
        headers: headersObj,
      }

      return originalFetch(input, sanitizedInit)
    } catch (error) {
      // Se QUALQUER coisa falhar, usar fetch original
      // Isso garante que nunca quebramos requisições legítimas
      return originalFetch(input, init)
    }
  }) as typeof fetch
}

export function createClient() {
  // Usar implementação padrão do @supabase/ssr sem customizações de cookies
  // O @supabase/ssr já gerencia cookies corretamente com Base64-URL encoding
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

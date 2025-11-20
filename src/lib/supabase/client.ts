import { createBrowserClient } from '@supabase/ssr'

// Polyfill fetch to sanitize headers globally (only on client side)
// IMPORTANT: This should NOT sanitize Supabase auth requests/headers
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Detectar URL da requisição de forma mais segura
    let requestUrl = ''
    let isSupabaseRequest = false
    
    try {
      if (typeof input === 'string') {
        requestUrl = input
      } else if (input instanceof URL) {
        requestUrl = input.href
      } else if (input && typeof input === 'object' && 'url' in input) {
        // É um objeto Request
        requestUrl = (input as Request).url
      }
      
      // Verificar se é requisição do Supabase ANTES de tentar sanitizar
      // Garantir que sempre retorne boolean
      isSupabaseRequest = requestUrl.includes('supabase.co') || 
                         requestUrl.includes('supabase') ||
                         (supabaseUrl !== '' && requestUrl.includes(supabaseUrl))
    } catch (error) {
      // Se não conseguir detectar URL, usar fetch original
      return originalFetch(input, init)
    }
    
    // Se for uma requisição para o Supabase, não sanitizar headers
    if (isSupabaseRequest) {
      return originalFetch(input, init)
    }
    
    // Se não tem init ou headers, usar fetch original
    if (!init || !init.headers) {
      return originalFetch(input, init)
    }

    // Tentar sanitizar headers apenas se conseguirmos acessá-los
    // Se houver qualquer erro, usar fetch original
    try {
      const headersObj: Record<string, string> = {}
      let hasValidHeaders = false
      
      if (init.headers instanceof Headers) {
        hasValidHeaders = true
        try {
          // Tentar iterar sobre headers de forma segura
          const headerEntries: Array<[string, string]> = []
          init.headers.forEach((value, key) => {
            headerEntries.push([key, value])
          })
          
          // Agora sanitizar cada header
          headerEntries.forEach(([key, value]) => {
            try {
              // Sanitize: remove non-ISO-8859-1 characters
              const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              const sanitizedValue = Array.from(value).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              if (sanitizedKey && sanitizedValue) {
                headersObj[sanitizedKey] = sanitizedValue
              }
            } catch (e) {
              // Ignorar header que falhou
            }
          })
        } catch (e) {
          // Se falhar ao iterar headers, usar fetch original
          return originalFetch(input, init)
        }
      } else if (Array.isArray(init.headers)) {
        hasValidHeaders = true
        init.headers.forEach(([key, value]) => {
          try {
            const sanitizedKey = Array.from(String(key)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
            const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
            if (sanitizedKey && sanitizedValue) {
              headersObj[sanitizedKey] = sanitizedValue
            }
          } catch (e) {
            // Ignorar header que falhou
          }
        })
      } else if (typeof init.headers === 'object' && init.headers !== null) {
        hasValidHeaders = true
        try {
          Object.entries(init.headers).forEach(([key, value]) => {
            try {
              const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              if (sanitizedKey && sanitizedValue) {
                headersObj[sanitizedKey] = sanitizedValue
              }
            } catch (e) {
              // Ignorar header que falhou
            }
          })
        } catch (e) {
          // Se falhar ao processar headers, usar fetch original
          return originalFetch(input, init)
        }
      }

      // Se não conseguiu processar headers ou não tem headers válidos, usar fetch original
      if (!hasValidHeaders || Object.keys(headersObj).length === 0) {
        return originalFetch(input, init)
      }

      // Create a new init object with sanitized headers
      const sanitizedInit: RequestInit = {
        ...init,
        headers: headersObj,
      }

      return originalFetch(input, sanitizedInit)
    } catch (error) {
      // Se qualquer coisa falhar, usar fetch original sem sanitização
      // Isso é seguro porque o fetch original vai funcionar normalmente
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

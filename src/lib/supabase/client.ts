import { createBrowserClient } from '@supabase/ssr'

// Polyfill fetch to sanitize headers globally (only on client side)
// IMPORTANT: This should NOT sanitize Supabase auth requests/headers
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Se for uma requisição para o Supabase, não sanitizar headers
    const url = typeof input === 'string' 
      ? input 
      : input instanceof URL 
        ? input.href 
        : (input as Request).url
    
    const isSupabaseRequest = url.includes('supabase.co') || 
                              url.includes('supabase') ||
                              url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    
    if (isSupabaseRequest) {
      // Para requisições do Supabase, usar fetch original sem sanitização
      return originalFetch(input, init)
    }
    
    if (!init || !init.headers) {
      return originalFetch(input, init)
    }

    // Convert headers to a plain object, sanitizing values
    const headersObj: Record<string, string> = {}
    
    try {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          // Sanitize: remove non-ISO-8859-1 characters
          const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          const sanitizedValue = Array.from(value).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          if (sanitizedKey && sanitizedValue) {
            headersObj[sanitizedKey] = sanitizedValue
          }
        })
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          const sanitizedKey = Array.from(String(key)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          if (sanitizedKey && sanitizedValue) {
            headersObj[sanitizedKey] = sanitizedValue
          }
        })
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          const sanitizedKey = Array.from(key).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          const sanitizedValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
          if (sanitizedKey && sanitizedValue) {
            headersObj[sanitizedKey] = sanitizedValue
          }
        })
      }
    } catch (error) {
      console.error('Error sanitizing headers:', error)
      // If sanitization fails, try without headers
      const { headers, ...rest } = init
      return originalFetch(input, rest)
    }

    // Create a new init object with sanitized headers
    const sanitizedInit: RequestInit = {
      ...init,
      headers: headersObj,
    }

    return originalFetch(input, sanitizedInit)
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

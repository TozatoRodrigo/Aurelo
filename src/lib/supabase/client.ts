import { createBrowserClient } from '@supabase/ssr'

// Polyfill fetch to sanitize headers globally (only on client side)
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          
          try {
            const cookies = document.cookie.split(';')
            const validCookies: Array<{ name: string; value: string }> = []
            
            for (const cookie of cookies) {
              const trimmed = cookie.trim()
              if (!trimmed) continue
              
              const equalIndex = trimmed.indexOf('=')
              if (equalIndex === -1) continue
              
              const name = trimmed.substring(0, equalIndex).trim()
              const value = trimmed.substring(equalIndex + 1).trim()
              
              if (!name || !value) continue
              
              try {
                const decodedName = decodeURIComponent(name)
                const decodedValue = decodeURIComponent(value)
                
                // Filter out non-ISO-8859-1 characters
                const cleanName = Array.from(decodedName).filter(c => c.charCodeAt(0) <= 0xFF).join('')
                const cleanValue = Array.from(decodedValue).filter(c => c.charCodeAt(0) <= 0xFF).join('')
                
                if (cleanName && cleanValue) {
                  validCookies.push({ name: cleanName, value: cleanValue })
                }
              } catch {
                // If decoding fails, try raw but clean
                const cleanName = Array.from(name).filter(c => c.charCodeAt(0) <= 0xFF).join('')
                const cleanValue = Array.from(value).filter(c => c.charCodeAt(0) <= 0xFF).join('')
                
                if (cleanName && cleanValue) {
                  validCookies.push({ name: cleanName, value: cleanValue })
                }
              }
            }
            
            return validCookies
          } catch (error) {
            console.error('Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          
          for (const { name, value, options } of cookiesToSet) {
            try {
              // Clean to ISO-8859-1
              const cleanName = Array.from(String(name)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              const cleanValue = Array.from(String(value)).filter(c => c.charCodeAt(0) <= 0xFF).join('')
              
              if (!cleanName || !cleanValue) continue
              
              const encodedName = encodeURIComponent(cleanName)
              const encodedValue = encodeURIComponent(cleanValue)
              
              let cookieString = `${encodedName}=${encodedValue}`
              
              if (options) {
                if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`
                if (options.domain) cookieString += `; Domain=${options.domain}`
                if (options.path) cookieString += `; Path=${options.path}`
                if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`
                if (options.secure) cookieString += `; Secure`
              }
              
              document.cookie = cookieString
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          }
        },
      },
    }
  )
}

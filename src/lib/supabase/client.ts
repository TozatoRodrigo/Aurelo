import { createBrowserClient } from '@supabase/ssr'

// Headers that should not be sanitized (they contain base64 or other encoded values)
const CRITICAL_HEADERS = ['authorization', 'apikey', 'x-client-info', 'x-client-version']

// Helper function to sanitize header values to ISO-8859-1
function sanitizeHeaderValue(value: string, headerName: string): string {
  // Don't sanitize critical headers - they are already properly encoded
  if (CRITICAL_HEADERS.includes(headerName.toLowerCase())) {
    return value
  }
  
  // For other headers, remove or encode non-ISO-8859-1 characters
  return value
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      // ISO-8859-1 range: 0x00-0xFF
      if (code > 0xFF) {
        // Encode non-ISO-8859-1 characters
        return encodeURIComponent(char)
      }
      return char
    })
    .join('')
}

// Custom fetch that sanitizes headers
function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!init || !init.headers) {
    return fetch(input, init)
  }

  // Create a new Headers object with sanitized values
  const sanitizedHeaders = new Headers()
  
  if (init.headers instanceof Headers) {
    init.headers.forEach((value, key) => {
      sanitizedHeaders.set(key, sanitizeHeaderValue(value, key))
    })
  } else if (Array.isArray(init.headers)) {
    init.headers.forEach(([key, value]) => {
      sanitizedHeaders.set(key, sanitizeHeaderValue(String(value), String(key)))
    })
  } else {
    Object.entries(init.headers).forEach(([key, value]) => {
      sanitizedHeaders.set(key, sanitizeHeaderValue(String(value), key))
    })
  }

  return fetch(input, {
    ...init,
    headers: sanitizedHeaders,
  })
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            try {
              return {
                name: decodeURIComponent(name),
                value: decodeURIComponent(rest.join('='))
              }
            } catch {
              // If decoding fails, return as-is
              return {
                name: name,
                value: rest.join('=')
              }
            }
          }).filter(cookie => cookie.name && cookie.value)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              // Encode cookie name and value to ensure ISO-8859-1 compatibility
              const encodedName = encodeURIComponent(name)
              const encodedValue = encodeURIComponent(String(value))
              
              let cookieString = `${encodedName}=${encodedValue}`
              
              if (options) {
                if (options.maxAge) {
                  cookieString += `; Max-Age=${options.maxAge}`
                }
                if (options.domain) {
                  cookieString += `; Domain=${options.domain}`
                }
                if (options.path) {
                  cookieString += `; Path=${options.path}`
                }
                if (options.sameSite) {
                  cookieString += `; SameSite=${options.sameSite}`
                }
                if (options.secure) {
                  cookieString += `; Secure`
                }
              }
              
              document.cookie = cookieString
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          })
        },
      },
      global: {
        fetch: safeFetch,
      },
    }
  )
}

import { createBrowserClient } from '@supabase/ssr'

// Headers that should not be sanitized (they contain base64 or other encoded values)
const CRITICAL_HEADERS = ['authorization', 'apikey', 'x-client-info', 'x-client-version']

// Helper function to remove non-ISO-8859-1 characters completely
function removeNonISO8859_1(str: string): string {
  const result: string[] = []
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const code = char.charCodeAt(0)
    
    // ISO-8859-1 range: 0x00-0xFF (0-255)
    // Keep only ASCII printable and extended ASCII (ISO-8859-1)
    if (code >= 0x00 && code <= 0xFF) {
      result.push(char)
    }
    // Skip characters outside ISO-8859-1 range
  }
  
  return result.join('')
}

// Helper function to sanitize header values
function sanitizeHeaderValue(value: string, headerName: string): string {
  // Don't sanitize critical headers - they are already properly encoded
  if (CRITICAL_HEADERS.includes(headerName.toLowerCase())) {
    // For critical headers, just ensure they're valid strings
    return String(value)
  }
  
  // For other headers, remove non-ISO-8859-1 characters
  return removeNonISO8859_1(String(value))
}

// Helper function to sanitize header names
function sanitizeHeaderName(name: string): string {
  // Header names should be ASCII, remove any non-ASCII
  return removeNonISO8859_1(String(name))
}

// Custom fetch that sanitizes headers
function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!init) {
    return fetch(input)
  }

  // If no headers, just pass through
  if (!init.headers) {
    return fetch(input, init)
  }

  // Create headers using a plain object first, then convert to Headers
  const headersObj: Record<string, string> = {}
  
  try {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        const sanitizedKey = sanitizeHeaderName(key)
        const sanitizedValue = sanitizeHeaderValue(value, key)
        if (sanitizedKey && sanitizedValue) {
          headersObj[sanitizedKey] = sanitizedValue
        }
      })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        const sanitizedKey = sanitizeHeaderName(String(key))
        const sanitizedValue = sanitizeHeaderValue(String(value), String(key))
        if (sanitizedKey && sanitizedValue) {
          headersObj[sanitizedKey] = sanitizedValue
        }
      })
    } else {
      Object.entries(init.headers).forEach(([key, value]) => {
        const sanitizedKey = sanitizeHeaderName(key)
        const sanitizedValue = sanitizeHeaderValue(String(value), key)
        if (sanitizedKey && sanitizedValue) {
          headersObj[sanitizedKey] = sanitizedValue
        }
      })
    }
    
    // Create Headers from the sanitized object
    const sanitizedHeaders = new Headers()
    Object.entries(headersObj).forEach(([key, value]) => {
      sanitizedHeaders.set(key, value)
    })
    
    return fetch(input, {
      ...init,
      headers: sanitizedHeaders,
    })
  } catch (error) {
    console.error('Error sanitizing headers:', error)
    // If sanitization fails completely, try without headers
    const { headers, ...restInit } = init
    return fetch(input, restInit)
  }
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

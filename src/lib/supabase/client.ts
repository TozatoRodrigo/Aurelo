import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return document.cookie.split(';').map(cookie => {
              const trimmed = cookie.trim()
              if (!trimmed) return null
              
              const equalIndex = trimmed.indexOf('=')
              if (equalIndex === -1) return null
              
              const name = trimmed.substring(0, equalIndex)
              const value = trimmed.substring(equalIndex + 1)
              
              try {
                // Decode cookie name and value
                const decodedName = decodeURIComponent(name)
                const decodedValue = decodeURIComponent(value)
                
                // Ensure decoded values are valid ISO-8859-1
                // If they contain non-ISO-8859-1 characters, re-encode them
                const safeName = decodedName.split('').map(char => {
                  const code = char.charCodeAt(0)
                  return code <= 0xFF ? char : encodeURIComponent(char)
                }).join('')
                
                const safeValue = decodedValue.split('').map(char => {
                  const code = char.charCodeAt(0)
                  return code <= 0xFF ? char : encodeURIComponent(char)
                }).join('')
                
                return {
                  name: safeName,
                  value: safeValue
                }
              } catch {
                // If decoding fails, use raw values but ensure they're safe
                const safeName = name.split('').map(char => {
                  const code = char.charCodeAt(0)
                  return code <= 0xFF ? char : ''
                }).join('')
                
                const safeValue = value.split('').map(char => {
                  const code = char.charCodeAt(0)
                  return code <= 0xFF ? char : ''
                }).join('')
                
                if (safeName && safeValue) {
                  return {
                    name: safeName,
                    value: safeValue
                  }
                }
                return null
              }
            }).filter((cookie): cookie is { name: string; value: string } => cookie !== null)
          } catch (error) {
            console.error('Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              // Ensure cookie name and value are safe for ISO-8859-1
              // First, ensure the raw values are safe
              const safeName = String(name).split('').map(char => {
                const code = char.charCodeAt(0)
                if (code > 0xFF) {
                  // Character outside ISO-8859-1, encode it
                  return encodeURIComponent(char)
                }
                return char
              }).join('')
              
              const safeValue = String(value).split('').map(char => {
                const code = char.charCodeAt(0)
                if (code > 0xFF) {
                  // Character outside ISO-8859-1, encode it
                  return encodeURIComponent(char)
                }
                return char
              }).join('')
              
              // Then encode for cookie storage
              const encodedName = encodeURIComponent(safeName)
              const encodedValue = encodeURIComponent(safeValue)
              
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
    }
  )
}

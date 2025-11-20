import { createBrowserClient } from '@supabase/ssr'

// Helper to check if a string contains only ISO-8859-1 characters
function isISO8859_1(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0xFF) {
      return false
    }
  }
  return true
}

// Helper to clean a string to ISO-8859-1
function cleanToISO8859_1(str: string): string {
  const result: string[] = []
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const code = char.charCodeAt(0)
    if (code <= 0xFF) {
      result.push(char)
    }
    // Skip characters outside ISO-8859-1
  }
  return result.join('')
}

// Clean all Supabase cookies that might have invalid characters
function cleanSupabaseCookies() {
  if (typeof document === 'undefined') return
  
  try {
    const cookies = document.cookie.split(';')
    const supabaseCookiePrefixes = ['sb-', 'supabase.auth.token']
    
    cookies.forEach(cookie => {
      const trimmed = cookie.trim()
      if (!trimmed) return
      
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex === -1) return
      
      const name = trimmed.substring(0, equalIndex).trim()
      
      // Check if it's a Supabase cookie
      const isSupabaseCookie = supabaseCookiePrefixes.some(prefix => 
        name.startsWith(prefix)
      )
      
      if (isSupabaseCookie) {
        try {
          const decodedName = decodeURIComponent(name)
          // If the decoded name contains non-ISO-8859-1, delete the cookie
          if (!isISO8859_1(decodedName)) {
            // Delete cookie by setting it to expire
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          }
        } catch {
          // If decoding fails, delete the cookie
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        }
      }
    })
  } catch (error) {
    console.error('Error cleaning cookies:', error)
  }
}

export function createClient() {
  // Clean invalid cookies on client creation
  if (typeof window !== 'undefined') {
    cleanSupabaseCookies()
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            const cookies = document.cookie.split(';')
            const validCookies: Array<{ name: string; value: string }> = []
            
            cookies.forEach(cookie => {
              const trimmed = cookie.trim()
              if (!trimmed) return
              
              const equalIndex = trimmed.indexOf('=')
              if (equalIndex === -1) return
              
              const name = trimmed.substring(0, equalIndex).trim()
              const value = trimmed.substring(equalIndex + 1).trim()
              
              if (!name || !value) return
              
              try {
                // Decode cookie
                const decodedName = decodeURIComponent(name)
                const decodedValue = decodeURIComponent(value)
                
                // Validate that decoded values are ISO-8859-1
                if (!isISO8859_1(decodedName) || !isISO8859_1(decodedValue)) {
                  // Invalid cookie, skip it
                  console.warn('Skipping cookie with non-ISO-8859-1 characters:', decodedName)
                  return
                }
                
                // Clean to ensure safety
                const cleanName = cleanToISO8859_1(decodedName)
                const cleanValue = cleanToISO8859_1(decodedValue)
                
                if (cleanName && cleanValue) {
                  validCookies.push({
                    name: cleanName,
                    value: cleanValue
                  })
                }
              } catch {
                // If decoding fails, try to use raw values but clean them
                const cleanName = cleanToISO8859_1(name)
                const cleanValue = cleanToISO8859_1(value)
                
                if (cleanName && cleanValue && isISO8859_1(cleanName) && isISO8859_1(cleanValue)) {
                  validCookies.push({
                    name: cleanName,
                    value: cleanValue
                  })
                }
              }
            })
            
            return validCookies
          } catch (error) {
            console.error('Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              // Ensure name and value are clean before encoding
              const cleanName = cleanToISO8859_1(String(name))
              const cleanValue = cleanToISO8859_1(String(value))
              
              // Validate they're ISO-8859-1
              if (!isISO8859_1(cleanName) || !isISO8859_1(cleanValue)) {
                console.warn('Skipping cookie with invalid characters:', cleanName)
                return
              }
              
              // Encode for cookie storage
              const encodedName = encodeURIComponent(cleanName)
              const encodedValue = encodeURIComponent(cleanValue)
              
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

import { createBrowserClient } from '@supabase/ssr'

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
    }
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualizar cookies na requisição
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          
          // Criar nova resposta com cookies atualizados
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Atualizar cookies na resposta
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANTE: Usar getSession() ao invés de getUser() para garantir refresh automático
  // O getSession() automaticamente refresha tokens expirados
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  // Log para debug (remover em produção)
  if (sessionError) {
    console.error('Middleware session error:', sessionError)
  }

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/onboarding')

  // Se não tem sessão e não está em página de auth, redirecionar para login
  if (!session && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se tem sessão e está em página de auth, redirecionar para home
  if (session && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

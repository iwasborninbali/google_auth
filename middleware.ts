import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Публичные маршруты, которые не требуют авторизации
const publicRoutes = [
  '/login',
  '/auth/callback',
  '/auth-error',
  '/api/auth',  // Для Supabase Auth endpoints
  '/_next',     // Для Next.js статических ресурсов
  '/static',    // Для статических файлов
  '/favicon.ico',
  '/public'
]

export async function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname)
  
  // Создаем response сразу
  const res = NextResponse.next()
  
  try {
    // Инициализируем Supabase клиент
    const supabase = createMiddlewareClient({ req, res })

    // Проверяем корневой путь
    if (req.nextUrl.pathname === '/') {
      console.log('Redirecting from root to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Проверяем, является ли текущий путь публичным
    const isPublicPath = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    if (isPublicPath) {
      console.log('Public path accessed:', req.nextUrl.pathname)
      return res
    }

    // Получаем сессию
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('Session status:', session ? 'Active' : 'None')

    // Если пользователь на странице логина и уже авторизован
    if (req.nextUrl.pathname === '/login' && session) {
      console.log('Logged in user trying to access login page, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Если нет сессии и путь не публичный, редиректим на логин
    if (!session) {
      console.log('No session, redirecting to login')
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 
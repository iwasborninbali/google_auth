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
]

export async function middleware(req: NextRequest) {
  // Создаем response сразу
  const res = NextResponse.next()
  
  // Инициализируем Supabase клиент
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Проверяем корневой путь
    if (req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Проверяем, является ли текущий путь публичным
    const isPublicPath = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    if (isPublicPath) {
      return res
    }

    // Получаем сессию
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Если пользователь на странице логина и уже авторизован
    if (req.nextUrl.pathname === '/login' && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Если нет сессии и путь не публичный, редиректим на логин
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      // Сохраняем URL, с которого пришли, чтобы вернуться после логина
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // В случае ошибки редиректим на страницу логина
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
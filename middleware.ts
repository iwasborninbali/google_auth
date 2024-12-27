import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Публичные маршруты, которые не требуют авторизации
// (если маршрут начинается на любой из ниже перечисленных,
//  middleware пропустит его без проверки сессии)
const publicRoutes = [
  '/login',
  '/auth/callback',
  '/auth-error',
  '/api/auth',  // Для Supabase Auth endpoints
  '/_next',     // Для Next.js статических ресурсов (JS, CSS и т.п.)
  '/static',    // Для статических файлов
  '/favicon.ico',
  '/public',
]

export async function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname)

  // Создаем "черновой" (пустой) ответ
  const res = NextResponse.next()

  try {
    // Инициализируем Supabase клиент (с auth-куками)
    const supabase = createMiddlewareClient({ req, res })

    // Если пользователь заходит на корень '/', отправляем на /dashboard
    if (req.nextUrl.pathname === '/') {
      console.log('Redirecting from root to /dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Проверяем, попадает ли путь в список публичных
    const isPublicPath = publicRoutes.some((route) =>
      req.nextUrl.pathname.startsWith(route)
    )

    // Если путь публичный, пропускаем
    if (isPublicPath) {
      console.log('Public path accessed:', req.nextUrl.pathname)
      return res
    }

    // Получаем сессию через Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      // При ошибке — отправляем на логин
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Логгируем, есть ли вообще сессия
    console.log('Session status:', session ? 'Active' : 'None')

    // Если пользователь уже авторизован и пытается открыть /login,
    // то отправляем на /dashboard
    if (req.nextUrl.pathname === '/login' && session) {
      console.log('Logged in user on /login -> redirect to /dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Если сессии нет, а путь не публичный — редиректим на /login
    if (!session) {
      console.log('No session, redirecting to /login')
      const redirectUrl = new URL('/login', req.url)
      // Можно сохранить URL, с которого пришли, чтобы потом туда вернуться
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Если дошли сюда — значит, пользователь залогинен и путь не публичный
    // Позволяем пройти дальше
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // На любой непредвиденной ошибке отправляем на /login
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Настройки для middleware:
// Матчим все пути, кроме:
//  - _next/static
//  - _next/image
//  - favicon.ico
//  - public/...
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
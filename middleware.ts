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
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

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

  // Если нет сессии, редиректим на логин
  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    // Сохраняем URL, с которого пришли, чтобы вернуться после логина
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
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
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.email) {
        // Try to insert the user into the users table
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            email: session.user.email,
            provider: 'google',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'email',
            ignoreDuplicates: false
          })

        if (upsertError) {
          console.error('Error storing user data:', upsertError)
          // We still continue with the redirect even if storing fails
          // You might want to handle this differently based on your requirements
        }
      }

      return NextResponse.redirect(requestUrl.origin)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
} 
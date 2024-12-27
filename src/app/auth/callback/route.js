import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  console.log('Auth callback started, code:', code ? 'present' : 'missing')

  if (code) {
    const cookieStore = cookies()
    console.log('Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Create auth client for session management
    const authClient = createServerClient(
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

    // Create admin client for database operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    const { error: sessionError } = await authClient.auth.exchangeCodeForSession(code)
    console.log('Exchange code for session:', sessionError ? `error: ${sessionError.message}` : 'success')
    
    if (!sessionError) {
      // Get the user's session
      const { data: { session }, error: getSessionError } = await authClient.auth.getSession()
      console.log('Get session:', getSessionError ? `error: ${getSessionError.message}` : 'success')
      console.log('Session data:', session ? `user email: ${session.user.email}` : 'no session')
      
      if (session?.user?.email) {
        try {
          // Call the RPC function to insert user
          const { data: rpcData, error: rpcError } = await adminClient.rpc('insert_user', {
            p_email: session.user.email,
            p_provider: 'google'
          })

          console.log('RPC call result:', rpcError ? `error: ${rpcError.message}` : 'success')
          console.log('RPC response data:', rpcData ? JSON.stringify(rpcData) : 'no data')
          
          if (rpcError) {
            console.error('Full RPC error:', JSON.stringify(rpcError))
          }
        } catch (error) {
          console.error('Try-catch error:', error.message)
        }
      } else {
        console.log('No user email in session')
      }

      return NextResponse.redirect(requestUrl.origin)
    } else {
      console.log('Session exchange failed:', sessionError)
    }
  }

  console.log('Redirecting to auth-error')
  return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
} 
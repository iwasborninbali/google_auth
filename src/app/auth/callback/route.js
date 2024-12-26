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
          persistSession: false
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
        const userData = {
          email: session.user.email,
          provider: 'google',
          updated_at: new Date().toISOString()
        }
        console.log('Attempting to upsert user with data:', JSON.stringify(userData))

        // First, let's check if the user already exists
        const { data: existingUser, error: selectError } = await adminClient
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()
        
        console.log('Check existing user:', selectError ? `error: ${selectError.message}` : `result: ${existingUser ? 'found' : 'not found'}`)
        
        // Try to insert the user into the users table
        const { data: upsertData, error: upsertError } = await adminClient
          .from('users')
          .upsert(userData, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select()

        console.log('Upsert user:', upsertError ? `error: ${upsertError.message}` : 'success')
        console.log('Upsert response data:', upsertData ? JSON.stringify(upsertData) : 'no data')
        
        if (upsertError) {
          console.error('Full upsert error:', JSON.stringify(upsertError))
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
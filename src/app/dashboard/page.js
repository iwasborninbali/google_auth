'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import HireRequestsGrid from '@/components/HireRequestsGrid'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [hireRequests, setHireRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()
        
        setUser(dbUser || user)
        
        const { data: requests, error } = await supabase
          .from('hire')
          .select('*')
          .eq('user_id', dbUser.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching hire requests:', error)
        } else {
          setHireRequests(requests || [])
        }
      }
      setLoading(false)
    }

    getUser()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-center px-4">Пожалуйста, войдите в систему</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary text-white py-4">
        <div className="container">
          <a href="/" className="logo">PLATFORM AI</a>
        </div>
      </header>

      <main className="container py-6 sm:py-8 px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Мои заявки на трудоустройство</h1>
        <div className="grid-layout">
          <HireRequestsGrid requests={hireRequests} />
        </div>
      </main>

      <footer className="bg-secondary text-white py-4 mt-auto">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} 
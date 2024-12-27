'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      // Получаем текущую сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        router.push('/login')
        return
      }

      // Получаем данные пользователя из нашей таблицы users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (!userError && userData) {
        setUser(userData)
      }
      
      setLoading(false)
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Загрузка...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 2rem'
      }}>
        <a href="/" className="logo">PLATFORM AI</a>
        <button onClick={handleLogout} className="btn-primary">
          Выйти
        </button>
      </header>

      <main style={{ 
        flex: 1,
        padding: '2rem',
        backgroundColor: 'var(--color-bg-light)'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'var(--color-white)',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ marginBottom: '2rem' }}>Личный кабинет</h1>
          
          {user && (
            <div>
              <div className="profile-field" style={{ marginBottom: '1.5rem' }}>
                <h3>Email</h3>
                <p>{user.email}</p>
              </div>

              <div className="profile-field" style={{ marginBottom: '1.5rem' }}>
                <h3>Дата регистрации</h3>
                <p>{new Date(user.created_at).toLocaleString('ru-RU')}</p>
              </div>

              <div className="profile-field">
                <h3>Способ входа</h3>
                <p>{user.provider}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '1rem 2rem', 
          display: 'flex', 
          justifyContent: 'center'
        }}>
          <p style={{ fontSize: '0.875rem' }}>© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} 
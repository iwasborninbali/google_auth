'use client'

import Auth from '@/components/Auth'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header>
        <a href="/" className="logo">PLATFORM AI</a>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-light)'
      }}>
        <div style={{
          backgroundColor: 'var(--color-white)',
          padding: '3rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h1 style={{ marginBottom: '1.5rem' }}>Добро пожаловать</h1>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>
            Войдите в систему, чтобы получить доступ к платформе
          </p>
          
          <Auth />
        </div>
      </main>

      <footer>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '0 2rem', 
          display: 'flex', 
          justifyContent: 'center'
        }}>
          <p style={{ fontSize: '0.875rem' }}>© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} 
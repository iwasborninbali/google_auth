'use client'

import Auth from '@/components/Auth'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-secondary text-white py-4">
        <div className="container">
          <div className="header-content">
            <Image
              src="/logo.png"
              alt="Platform AI Logo"
              width={32}
              height={32}
              className="header-logo"
            />
            <a href="/" className="logo">PLATFORM AI</a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-muted px-4 py-8">
        <div className="bg-background p-6 sm:p-8 md:p-12 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Добро пожаловать</h1>
          <p className="text-secondary mb-8 text-center">
            Войдите в систему, чтобы получить доступ к платформе
          </p>
          
          <Auth />
        </div>
      </main>

      <footer className="bg-secondary text-white py-4">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} 
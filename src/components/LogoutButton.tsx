'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    try {
      setIsLoggingOut(true)
      
      // Выполняем выход
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Очищаем куки Supabase
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name] = cookie.split('=')
        if (name.trim().startsWith('sb-')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
        }
      }

      // Принудительно обновляем страницу и редиректим
      router.push('/login')
      router.refresh()
      
      // Даем время на обновление состояния
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoggingOut ? 'Выход...' : 'Выйти'}</span>
    </Button>
  )
} 
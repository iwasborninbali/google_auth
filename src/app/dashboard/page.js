'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const employmentTypeTranslations = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  'contract': 'Контракт'
}

const workBookTranslations = {
  'paper': 'Бумажная трудовая книжка',
  'electronic': 'Электронная трудовая книжка',
  'none': 'Первое трудоустройство'
}

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
        // Получаем пользователя из таблицы users
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()
        
        setUser(dbUser || user)
        
        // Получаем все заявки пользователя
        const { data: requests, error } = await supabase
          .from('hire')
          .select('*')
          .eq('user_id', dbUser.id)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Пожалуйста, войдите в систему</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Мои заявки на трудоустройство</h1>
      
      {hireRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">У вас пока нет заявок на трудоустройство</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hireRequests.map((request) => (
            <Card key={request.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">{request.company_name}</CardTitle>
                <CardDescription>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
                    {statusTranslations[request.status]}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-semibold">Сотрудник:</span> {request.employee_name}</p>
                  <p><span className="font-semibold">Должность:</span> {request.position}</p>
                  <p><span className="font-semibold">Тип занятости:</span> {employmentTypeTranslations[request.employment_type]}</p>
                  <p><span className="font-semibold">Трудовая книжка:</span> {workBookTranslations[request.work_book_type]}</p>
                  <p className="text-sm text-gray-500">
                    Создано: {new Date(request.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 
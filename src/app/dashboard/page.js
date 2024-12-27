'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, FileEdit } from 'lucide-react'

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  approved: <CheckCircle className="w-5 h-5 text-green-500" />,
  rejected: <XCircle className="w-5 h-5 text-red-500" />,
  draft: <FileEdit className="w-5 h-5 text-gray-500" />
}

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
}

export default function DashboardPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data: requests, error } = await supabase
        .from('hire')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(requests || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

      <main className="container py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Заявки на трудоустройство</h1>
          <Button
            onClick={() => router.push('/hire')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Новая заявка
          </Button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Нет заявок</h3>
            <p className="mt-2 text-gray-500">Создайте новую заявку, чтобы начать.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/hire/${request.id}`)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                        {request.company_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {request.employee_name}
                      </p>
                    </div>
                    {statusIcons[request.status]}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Должность</p>
                      <p className="font-medium line-clamp-1">{request.position}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${statusColors[request.status]}`}>
                        {statusTranslations[request.status]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-secondary text-white py-4 mt-auto">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} 
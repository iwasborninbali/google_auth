'use client';

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import HireRequestDetails from './HireRequestDetails'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
}

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик'
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

export default function HireRequestsGrid({ requests = [] }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const router = useRouter();

  const handleRequestClick = (request) => {
    if (request.status === 'draft') {
      // Если черновик - перенаправляем на страницу загрузки документов
      router.push(`/hire/upload/${request.id}`);
    } else {
      // Иначе показываем детали
      setSelectedRequest(request);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">У вас пока нет заявок на трудоустройство</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((request) => (
          <Card 
            key={request.id} 
            className={`shadow-lg cursor-pointer transition-transform hover:scale-[1.02] ${
              request.status === 'draft' ? 'border-dashed' : ''
            }`}
            onClick={() => handleRequestClick(request)}
          >
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
                {request.status === 'draft' && (
                  <Button 
                    className="w-full mt-4"
                    variant="outline"
                  >
                    Завершить подачу заявки
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <HireRequestDetails
        hireId={selectedRequest?.id}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  )
} 
'use client';

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import HireRequestDetails from './HireRequestDetails'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  deleted: 'bg-red-100 text-red-800'
}

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик',
  deleted: 'Удалено'
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
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleRequestClick = (request) => {
    if (request.status === 'draft') {
      router.push(`/hire/upload/${request.id}`);
    } else {
      setSelectedRequest(request);
    }
  };

  const handleDeleteClick = async (e, request) => {
    e.preventDefault(); // Предотвращаем всплытие события клика
    e.stopPropagation(); // Предотвращаем всплытие события клика
    setRequestToDelete(request);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      
      // Обновляем статус заявки на deleted
      const { error } = await supabase
        .from('hire')
        .update({ status: 'deleted' })
        .eq('id', requestToDelete.id);

      if (error) throw error;

      // Обновляем UI, удаляя заявку из списка
      requests = requests.filter(r => r.id !== requestToDelete.id);
      
      toast.success('Заявка успешно удалена');
      router.refresh(); // Обновляем страницу для отображения изменений
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Ошибка при удалении заявки');
    } finally {
      setIsDeleting(false);
      setRequestToDelete(null);
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
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">{request.company_name}</CardTitle>
                <CardDescription>
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
                    {statusTranslations[request.status]}
                  </span>
                </CardDescription>
              </div>
              {request.status !== 'draft' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={(e) => handleDeleteClick(e, request)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      <AlertDialog open={!!requestToDelete} onOpenChange={() => !isDeleting && setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление заявки</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить заявку для компании "{requestToDelete?.company_name}"?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
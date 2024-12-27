'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
};

const employmentTypeTranslations = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  'contract': 'Контракт'
};

const workBookTranslations = {
  'paper': 'Бумажная трудовая книжка',
  'electronic': 'Электронная трудовая книжка',
  'none': 'Первое трудоустройство'
};

export default function HireRequestDetails({ request, showDeleteButton = false, onRequestDeleted }) {
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (request?.id) {
      loadFiles();
    }
  }, [request]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data: files, error } = await supabase.storage
        .from('hire')
        .list(`${request.user_id}/${request.id}`);

      if (error) throw error;
      setFiles(files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = async (filePath) => {
    const { data } = supabase.storage
      .from('hire')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('hire')
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;
      
      toast.success('Заявка перемещена в архив');
      setShowDeleteDialog(false);
      if (onRequestDeleted) {
        onRequestDeleted();
      }
    } catch (error) {
      console.error('Error archiving request:', error);
      toast.error('Ошибка при архивации заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!request) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Заявка на трудоустройство</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${statusColors[request.status]}`}>
              {statusTranslations[request.status]}
            </span>
          </div>
          {showDeleteButton && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Компания</h3>
              <p>{request.company_name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Сотрудник</h3>
              <p>{request.employee_name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Должность</h3>
              <p>{request.position}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Тип занятости</h3>
              <p>{employmentTypeTranslations[request.employment_type]}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Трудовая книжка</h3>
              <p>{workBookTranslations[request.work_book_type]}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Дата создания</h3>
              <p>{new Date(request.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>

          {/* Документы */}
          <div>
            <h3 className="font-semibold mb-4">Документы</h3>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Загрузка документов...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Документы не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div key={file.name} className="flex items-center p-3 border rounded-lg">
                    <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const url = await getFileUrl(`${request.user_id}/${request.id}/${file.name}`);
                        window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Архивация заявки</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите архивировать заявку для компании "{request.company_name}"?
              Заявка будет перемещена в архив.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              onClick={() => setShowDeleteDialog(false)}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Архивация...' : 'Архивировать'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
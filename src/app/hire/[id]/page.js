'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DeleteHireRequest from '@/components/DeleteHireRequest';
import DocumentPreview from '@/components/DocumentPreview';

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

export default function HireRequestPage({ params }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const { data: request, error } = await supabase
          .from('hire')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setRequest(request);

        // Загружаем файлы после получения заявки
        if (request) {
          setLoadingFiles(true);
          const { data: files, error: filesError } = await supabase.storage
            .from('hire')
            .list(`${request.user_id}/${request.id}`);

          if (filesError) throw filesError;
          setFiles(files || []);
          setLoadingFiles(false);
        }
      } catch (error) {
        console.error('Error loading request:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadRequest();
    }
  }, [params.id]);

  const getFileUrl = async (filePath) => {
    const { data } = supabase.storage
      .from('hire')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к списку заявок
        </Button>
        <DeleteHireRequest 
          request={request}
          onRequestDeleted={() => router.push('/dashboard')}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Заявка на трудоустройство</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${statusColors[request.status]}`}>
              {statusTranslations[request.status]}
            </span>
          </div>
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
            {loadingFiles ? (
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
                  <DocumentPreview
                    key={file.name}
                    file={file}
                    fileUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hire/${request.user_id}/${request.id}/${file.name}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
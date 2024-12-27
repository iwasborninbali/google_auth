'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink } from 'lucide-react';

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

export default function HireRequestDetails({ hireId, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [files, setFiles] = useState([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (hireId && isOpen) {
      loadRequestDetails();
    }
  }, [hireId, isOpen]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      
      // Получаем детали заявки
      const { data: request, error } = await supabase
        .from('hire')
        .select('*')
        .eq('id', hireId)
        .single();

      if (error) throw error;
      setRequest(request);

      // Получаем список файлов из Storage
      const { data: files, error: filesError } = await supabase.storage
        .from('hire')
        .list(`${request.user_id}/${hireId}`);

      if (filesError) throw filesError;
      setFiles(files);

    } catch (error) {
      console.error('Error loading request details:', error);
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

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Заявка на трудоустройство</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
              {statusTranslations[request.status]}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div key={file.name} className="flex items-center p-3 border rounded-lg">
                  <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const url = await getFileUrl(`${request.user_id}/${hireId}/${file.name}`);
                      window.open(url, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
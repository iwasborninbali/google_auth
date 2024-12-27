'use client';

import { useState, useEffect } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import { createBrowserClient } from '@supabase/ssr';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function UploadDocumentsForm({ request, onUploadComplete }) {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const checkExistingFiles = async () => {
      try {
        setLoading(true);
        const { data: files, error } = await supabase.storage
          .from('hire')
          .list(`${request.user_id}/${request.id}`);

        if (error) throw error;

        // Создаем объект с информацией о загруженных файлах
        const uploadedFilesMap = {};
        files.forEach(file => {
          // Определяем тип документа по имени файла
          if (file.name.includes('passport')) uploadedFilesMap.passport = file;
          if (file.name.includes('snils')) uploadedFilesMap.snils = file;
          if (file.name.includes('inn')) uploadedFilesMap.inn = file;
          if (file.name.includes('bankDetails')) uploadedFilesMap.bankDetails = file;
          if (file.name.includes('workBook')) uploadedFilesMap.workBookFile = file;
        });

        setUploadedFiles(uploadedFilesMap);
      } catch (error) {
        console.error('Error checking existing files:', error);
      } finally {
        setLoading(false);
      }
    };

    if (request?.id) {
      checkExistingFiles();
    }
  }, [request]);

  const requiredDocuments = [
    { type: 'passport', title: 'Паспорт', description: 'Загрузите скан или фото паспорта', required: true },
    { type: 'snils', title: 'СНИЛС', description: 'Загрузите скан или фото СНИЛС', required: true },
    { type: 'inn', title: 'ИНН', description: 'Загрузите скан или фото ИНН', required: true },
    { type: 'bankDetails', title: 'Банковские реквизиты', description: 'Загрузите файл с банковскими реквизитами', required: true },
    ...(request.work_book_type !== 'none' ? [{
      type: 'workBookFile',
      title: 'Трудовая книжка',
      description: `Загрузите скан ${request.work_book_type === 'paper' ? 'бумажной' : 'электронной'} трудовой книжки`,
      required: true
    }] : [])
  ];

  const missingDocuments = requiredDocuments.filter(doc => !uploadedFiles[doc.type]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Загрузка документов</h1>
      <div className="mb-6">
        <p className="text-gray-600">
          Заявка для компании: <span className="font-semibold">{request.company_name}</span>
        </p>
        <p className="text-gray-600">
          Сотрудник: <span className="font-semibold">{request.employee_name}</span>
        </p>
      </div>

      {missingDocuments.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Необходимо загрузить следующие документы:
            <ul className="list-disc list-inside mt-2">
              {missingDocuments.map(doc => (
                <li key={doc.type}>{doc.title}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <DocumentUpload
        formData={request}
        hireId={request.id}
        existingFiles={uploadedFiles}
        onUpload={(docType, fileUrl) => {
          setUploadedFiles(prev => ({
            ...prev,
            [docType]: { name: fileUrl }
          }));
          
          // После загрузки всех файлов
          if (docType === 'bankDetails' || Object.keys(uploadedFiles).length === requiredDocuments.length - 1) {
            onUploadComplete();
          }
        }}
        documents={requiredDocuments}
      />
    </div>
  );
} 
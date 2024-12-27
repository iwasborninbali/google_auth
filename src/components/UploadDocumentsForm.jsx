'use client';

import DocumentUpload from '@/components/DocumentUpload';

export default function UploadDocumentsForm({ request, onUploadComplete }) {
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

      <DocumentUpload
        formData={request}
        hireId={request.id}
        onUpload={(docType, fileUrl) => {
          // После загрузки всех файлов
          if (docType === 'bankDetails') {
            onUploadComplete();
          }
        }}
        documents={[
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
        ]}
      />
    </div>
  );
} 
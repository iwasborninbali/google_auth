'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import DeleteHireRequest from './DeleteHireRequest';

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
  if (!request) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Заявка на трудоустройство</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${statusColors[request.status]}`}>
            {statusTranslations[request.status]}
          </span>
        </div>
        {showDeleteButton && (
          <DeleteHireRequest 
            request={request}
            onRequestDeleted={onRequestDeleted}
          />
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
      </div>
    </div>
  );
} 
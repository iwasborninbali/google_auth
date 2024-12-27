'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadDocumentsForm from '@/components/UploadDocumentsForm';

export default function UploadDocumentsPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Получаем пользователя из таблицы users
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        setUser(dbUser || user);

        // Получаем заявку
        const { data: request, error } = await supabase
          .from('hire')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        // Проверяем, что заявка принадлежит пользователю
        if (request.user_id !== (dbUser?.id || user.id)) {
          toast.error('У вас нет доступа к этой заявке');
          router.push('/dashboard');
          return;
        }

        setRequest(request);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Ошибка при загрузке данных');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, router, supabase]);

  const handleUploadComplete = async () => {
    try {
      // Обновляем статус заявки
      const { error } = await supabase
        .from('hire')
        .update({ status: 'pending' })
        .eq('id', params.id);

      if (error) throw error;

      toast.success('Заявка успешно обновлена');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Ошибка при обновлении заявки');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Заявка не найдена</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <UploadDocumentsForm 
        request={request} 
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import UploadDocumentsForm from '@/components/UploadDocumentsForm';
import Image from 'next/image';

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        setUser(dbUser || user);

        const { data: request, error } = await supabase
          .from('hire')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-center px-4">Заявка не найдена</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary text-white py-4">
        <div className="container">
          <div className="header-content">
            <Image
              src="/logo.png"
              alt="Platform AI Logo"
              width={32}
              height={32}
              className="header-logo"
            />
            <a href="/" className="logo">PLATFORM AI</a>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <UploadDocumentsForm 
            request={request} 
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </main>

      <footer className="bg-secondary text-white py-4 mt-auto">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
} 
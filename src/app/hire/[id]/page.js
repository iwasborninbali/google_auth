'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import HireRequestDetails from '@/components/HireRequestDetails';
import Image from 'next/image';

export default function HireRequestPage({ params }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!request) {
    return null;
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
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm sm:text-base"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к списку заявок
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
          <HireRequestDetails 
            request={request}
            showDeleteButton={true}
            onRequestDeleted={() => router.push('/dashboard')}
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
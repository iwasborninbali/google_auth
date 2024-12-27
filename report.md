# Project Report

## Skipping './prisma': not found or not a regular file/directory

## Directory: ./public

## Directory: ./src

### File: ./src/app/layout.js
```
import { Inter } from "next/font/google"
import "./globals.css"
import { SideMenu } from "@/components/SideMenu"
import LogoutButton from '@/components/LogoutButton'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SideMenu />
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <nav>
                {/* Существующая навигация... */}
              </nav>
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
```

### File: ./src/app/auth/callback/route.js
```
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  console.log('Auth callback started, code:', code ? 'present' : 'missing')

  if (code) {
    const cookieStore = cookies()
    console.log('Creating Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Create auth client for session management
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Create admin client for database operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    const { error: sessionError } = await authClient.auth.exchangeCodeForSession(code)
    console.log('Exchange code for session:', sessionError ? `error: ${sessionError.message}` : 'success')
    
    if (!sessionError) {
      // Get the user's session
      const { data: { session }, error: getSessionError } = await authClient.auth.getSession()
      console.log('Get session:', getSessionError ? `error: ${getSessionError.message}` : 'success')
      console.log('Session data:', session ? `user email: ${session.user.email}` : 'no session')
      
      if (session?.user?.email) {
        try {
          // Call the RPC function to insert user
          const { data: rpcData, error: rpcError } = await adminClient.rpc('insert_user', {
            p_email: session.user.email,
            p_provider: 'google'
          })

          console.log('RPC call result:', rpcError ? `error: ${rpcError.message}` : 'success')
          console.log('RPC response data:', rpcData ? JSON.stringify(rpcData) : 'no data')
          
          if (rpcError) {
            console.error('Full RPC error:', JSON.stringify(rpcError))
          }
        } catch (error) {
          console.error('Try-catch error:', error.message)
        }
      } else {
        console.log('No user email in session')
      }

      return NextResponse.redirect(`${requestUrl.origin}/profile`)
    } else {
      console.log('Session exchange failed:', sessionError)
    }
  }

  console.log('Redirecting to auth-error')
  return NextResponse.redirect(`${requestUrl.origin}/auth-error`)
} ```

### File: ./src/app/page.jsx
```
export default function Home() {
  return (
    <main className="min-h-screen bg-platform-bg-light">
      <header className="bg-platform-secondary text-white py-4">
        <div className="container mx-auto px-4">
          <a href="/" className="text-platform-primary font-bold text-xl">
            PLATFORM AI
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-platform-secondary mb-8">
            Добро пожаловать в PLATFORM AI
          </h1>
          <p className="text-lg mb-8 text-platform-secondary">
            Система управления персоналом
          </p>
          <a 
            href="/hire" 
            className="inline-block bg-platform-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Оформить сотрудника
          </a>
        </div>
      </div>

      <footer className="bg-platform-secondary text-white py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}

```

### File: ./src/app/page.module.css
```
.page {
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;

  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);
}

@media (prefers-color-scheme: dark) {
  .page {
    --gray-rgb: 255, 255, 255;
    --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
    --gray-alpha-100: rgba(var(--gray-rgb), 0.06);

    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
  }
}

.main {
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;
}

.main ol {
  font-family: var(--font-geist-mono);
  padding-left: 0;
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.01em;
  list-style-position: inside;
}

.main li:not(:last-of-type) {
  margin-bottom: 8px;
}

.main code {
  font-family: inherit;
  background: var(--gray-alpha-100);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.ctas {
  display: flex;
  gap: 16px;
}

.ctas a {
  appearance: none;
  border-radius: 128px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
}

a.primary {
  background: var(--foreground);
  color: var(--background);
  gap: 8px;
}

a.secondary {
  border-color: var(--gray-alpha-200);
  min-width: 180px;
}

.footer {
  grid-row-start: 3;
  display: flex;
  gap: 24px;
}

.footer a {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer img {
  flex-shrink: 0;
}

/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }

  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }

  .footer a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 32px;
    padding-bottom: 80px;
  }

  .main {
    align-items: center;
  }

  .main ol {
    text-align: center;
  }

  .ctas {
    flex-direction: column;
  }

  .ctas a {
    font-size: 14px;
    height: 40px;
    padding: 0 16px;
  }

  a.secondary {
    min-width: auto;
  }

  .footer {
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }
}
```

### File: ./src/app/dashboard/page.js
```
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, FileEdit } from 'lucide-react'

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  approved: <CheckCircle className="w-5 h-5 text-green-500" />,
  rejected: <XCircle className="w-5 h-5 text-red-500" />,
  draft: <FileEdit className="w-5 h-5 text-gray-500" />
}

const statusTranslations = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800'
}

export default function DashboardPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data: requests, error } = await supabase
        .from('hire')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(requests || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary text-white py-4">
        <div className="container">
          <a href="/" className="logo">PLATFORM AI</a>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Заявки на трудоустройство</h1>
          <Button
            onClick={() => router.push('/hire')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Новая заявка
          </Button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Нет заявок</h3>
            <p className="mt-2 text-gray-500">Создайте новую заявку, чтобы начать.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/hire/${request.id}`)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                        {request.company_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {request.employee_name}
                      </p>
                    </div>
                    {statusIcons[request.status]}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Должность</p>
                      <p className="font-medium line-clamp-1">{request.position}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${statusColors[request.status]}`}>
                        {statusTranslations[request.status]}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-secondary text-white py-4 mt-auto">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} ```

### File: ./src/app/hire/page.js
```
'use client';

import MultiStepForm from '@/components/MultiStepForm';

export default function HirePage() {
  return (
    <div className="min-h-screen bg-platform-bg-light">
      <header className="bg-platform-secondary text-white py-4">
        <div className="container mx-auto px-4">
          <a href="/" className="text-platform-primary font-bold text-xl">
            PLATFORM AI
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-platform-secondary mb-8 text-center">
            Оформление сотрудника
          </h1>
          <p className="text-center mb-8 text-platform-secondary">
            Заполните форму для оформления нового сотрудника в компанию
          </p>
          
          <MultiStepForm />
        </div>
      </main>

      <footer className="bg-platform-secondary text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
} ```

### File: ./src/app/hire/[id]/page.js
```
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
} ```

### File: ./src/app/hire/upload/[id]/page.js
```
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
} ```

### File: ./src/app/globals.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* PLATFORM AI Brand Colors */
    --color-primary: 45 18% 55%; /* #B79D64 Золотой */
    --color-secondary: 0 0% 18%; /* #2E2E2E Графитовый */
    --color-bg-light: 0 0% 96%; /* #F5F5F5 Светлый серый */
    --color-accent: 197 86% 59%; /* #3FC6F0 Небесно-голубой */

    /* shadcn/ui system colors mapped to our brand */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: var(--color-secondary);
 
    --popover: 0 0% 100%;
    --popover-foreground: var(--color-secondary);
 
    --primary: var(--color-primary);
    --primary-foreground: 0 0% 100%;
 
    --secondary: var(--color-secondary);
    --secondary-foreground: 0 0% 100%;
 
    --muted: var(--color-bg-light);
    --muted-foreground: 0 0% 40%;
 
    --accent: var(--color-accent);
    --accent-foreground: 0 0% 100%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: var(--color-bg-light);
    --input: var(--color-bg-light);
    --ring: var(--color-primary);
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: var(--color-secondary);
    --foreground: 0 0% 100%;
 
    --card: var(--color-secondary);
    --card-foreground: 0 0% 100%;
 
    --popover: var(--color-secondary);
    --popover-foreground: 0 0% 100%;
 
    --primary: var(--color-primary);
    --primary-foreground: 0 0% 100%;
 
    --secondary: 0 0% 25%;
    --secondary-foreground: 0 0% 100%;
 
    --muted: 0 0% 25%;
    --muted-foreground: 0 0% 70%;
 
    --accent: var(--color-accent);
    --accent-foreground: 0 0% 100%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 100%;
 
    --border: 0 0% 25%;
    --input: 0 0% 25%;
    --ring: var(--color-primary);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html, body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Jost', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold text-foreground mb-2 leading-tight;
  }

  h1 { @apply text-4xl; }
  h2 { @apply text-3xl; }
  h3 { @apply text-2xl; }

  p { @apply mb-4; }

  a {
    @apply text-primary no-underline hover:underline focus:underline;
  }
}

@layer components {
  .header-logo {
    @apply h-8 w-auto mr-3;
  }

  .header-content {
    @apply flex items-center;
  }

  .logo {
    @apply text-primary font-bold text-xl no-underline ml-2;
  }

  .btn-primary {
    @apply bg-primary text-white hover:opacity-90 transition-opacity;
  }

  .btn-accent {
    @apply bg-accent text-white hover:opacity-90 transition-opacity;
  }

  header, footer {
    @apply bg-secondary text-white py-4;
  }

  header nav a,
  footer nav a {
    @apply text-white mx-2 font-medium hover:underline;
  }

  /* Container responsive padding */
  .container {
    @apply px-4 sm:px-6 lg:px-8;
  }

  /* Form controls responsive sizing */
  .form-control {
    @apply w-full max-w-md mx-auto;
  }

  /* Card responsive padding */
  .card {
    @apply p-4 sm:p-6 md:p-8;
  }

  /* Grid layout for dashboard */
  .grid-layout {
    @apply grid gap-4 sm:gap-6 md:gap-8;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

/* Mobile-first responsive styles */
@media (max-width: 768px) {
  h1 { @apply text-3xl; }
  h2 { @apply text-2xl; }
  h3 { @apply text-xl; }

  .logo {
    @apply text-lg ml-2;
  }

  /* Improved touch targets */
  button, 
  .btn-primary,
  .btn-accent,
  a {
    @apply min-h-[44px] px-4;
  }

  /* Stack items vertically on mobile */
  .flex-col-mobile {
    @apply flex-col;
  }

  /* Adjust spacing for mobile */
  .container {
    @apply py-4;
  }

  /* Full width forms on mobile */
  .form-control {
    @apply max-w-full;
  }

  /* Improved mobile navigation */
  header nav {
    @apply flex-wrap justify-center gap-2;
  }

  /* Adjust footer for mobile */
  footer {
    @apply text-sm;
  }
}

/* Improved touch targets for mobile */
@media (hover: none) and (pointer: coarse) {
  button,
  .btn-primary,
  .btn-accent,
  a {
    @apply min-h-[44px] px-4;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }
}
```

### File: ./src/app/login/page.js
```
'use client'

import Auth from '@/components/Auth'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
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

      <main className="flex-1 flex items-center justify-center bg-muted px-4 py-8">
        <div className="bg-background p-6 sm:p-8 md:p-12 rounded-lg shadow-md w-full max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Добро пожаловать</h1>
          <p className="text-secondary mb-8 text-center">
            Войдите в систему, чтобы получить доступ к платформе
          </p>
          
          <Auth />
        </div>
      </main>

      <footer className="bg-secondary text-white py-4">
        <div className="container text-center">
          <p className="text-sm">© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
} ```

### File: ./src/components/ui/aspect-ratio.tsx
```
"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
```

### File: ./src/components/ui/alert-dialog.tsx
```
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = ({
  className,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogPortalProps) => (
  <AlertDialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {children}
    </div>
  </AlertDialogPrimitive.Portal>
)
AlertDialogPortal.displayName = AlertDialogPrimitive.Portal.displayName

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-background p-6 opacity-100 shadow-lg animate-in fade-in-90 slide-in-from-bottom-10 sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

### File: ./src/components/ui/sheet.tsx
```
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const portalVariants = cva("fixed inset-0 z-50 flex", {
  variants: {
    position: {
      top: "items-start",
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
    },
  },
  defaultVariants: { position: "right" },
})

interface SheetPortalProps
  extends SheetPrimitive.DialogPortalProps,
    VariantProps<typeof portalVariants> {}

const SheetPortal = ({
  position,
  className,
  children,
  ...props
}: SheetPortalProps) => (
  <SheetPrimitive.Portal className={cn(className)} {...props}>
    <div className={portalVariants({ position })}>{children}</div>
  </SheetPrimitive.Portal>
)
SheetPortal.displayName = SheetPrimitive.Portal.displayName

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg border",
  {
    variants: {
      position: {
        top: "animate-in slide-in-from-top w-full duration-300",
        bottom: "animate-in slide-in-from-bottom w-full duration-300",
        left: "animate-in slide-in-from-left h-full duration-300",
        right: "animate-in slide-in-from-right h-full duration-300",
      },
      size: {
        content: "",
        default: "",
        sm: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    compoundVariants: [
      {
        position: ["top", "bottom"],
        size: "content",
        class: "max-h-screen",
      },
      {
        position: ["top", "bottom"],
        size: "default",
        class: "h-1/3",
      },
      {
        position: ["top", "bottom"],
        size: "sm",
        class: "h-1/4",
      },
      {
        position: ["top", "bottom"],
        size: "lg",
        class: "h-1/2",
      },
      {
        position: ["top", "bottom"],
        size: "xl",
        class: "h-5/6",
      },
      {
        position: ["top", "bottom"],
        size: "full",
        class: "h-screen",
      },
      {
        position: ["right", "left"],
        size: "content",
        class: "max-w-screen",
      },
      {
        position: ["right", "left"],
        size: "default",
        class: "w-1/3",
      },
      {
        position: ["right", "left"],
        size: "sm",
        class: "w-1/4",
      },
      {
        position: ["right", "left"],
        size: "lg",
        class: "w-1/2",
      },
      {
        position: ["right", "left"],
        size: "xl",
        class: "w-5/6",
      },
      {
        position: ["right", "left"],
        size: "full",
        class: "w-screen",
      },
    ],
    defaultVariants: {
      position: "right",
      size: "default",
    },
  }
)

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  DialogContentProps
>(({ position, size, className, children, ...props }, ref) => (
  <SheetPortal position={position}>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ position, size }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

### File: ./src/components/ui/input.jsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
```

### File: ./src/components/ui/select.jsx
```
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn("p-1", position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

### File: ./src/components/ui/accordion.tsx
```
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

### File: ./src/components/ui/alert.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```

### File: ./src/components/ui/calendar.tsx
```
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
```

### File: ./src/components/ui/progress.jsx
```
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### File: ./src/components/ui/card.jsx
```
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### File: ./src/components/ui/avatar.tsx
```
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

### File: ./src/components/ui/dialog.tsx
```
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

### File: ./src/components/ui/badge.tsx
```
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary hover:bg-primary/80 border-transparent text-primary-foreground",
        secondary:
          "bg-secondary hover:bg-secondary/80 border-transparent text-secondary-foreground",
        destructive:
          "bg-destructive hover:bg-destructive/80 border-transparent text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### File: ./src/components/ui/button.tsx
```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### File: ./src/components/ui/label.jsx
```
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

### File: ./src/components/ui/dropdown-menu.tsx
```
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

### File: ./src/components/HireRequestDetails.jsx
```
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
} ```

### File: ./src/components/UploadDocumentsForm.jsx
```
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
} ```

### File: ./src/components/LogoutButton.tsx
```
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Выйти</span>
    </Button>
  )
} ```

### File: ./src/components/Auth.js
```
'use client'

import { createClient } from '@/lib/supabase'

export default function Auth() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error.message)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="btn-primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '1rem'
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        style={{ width: '24px', height: '24px' }}
      >
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Войти через Google
    </button>
  )
} ```

### File: ./src/components/DeleteHireRequest.jsx
```
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';

export default function DeleteHireRequest({ request, onRequestDeleted }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('[DeleteHireRequest] Rendered with request:', request);

  if (!request || request.status === 'draft') {
    console.log('[DeleteHireRequest] No request or status is draft. Returning null.');
    return null;
  }

  const handleDelete = async () => {
    console.log('[DeleteHireRequest] handleDelete called');
    console.log('[DeleteHireRequest] Deleting request with id:', request.id);

    try {
      setIsDeleting(true);
      console.log('[DeleteHireRequest] Starting delete operation...');

      const { data, error } = await supabase
        .from('hire')
        .update({
          status: 'deleted'
        })
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        console.error('[DeleteHireRequest] Error updating request:', error);
        toast.error('Ошибка при архивации заявки');
        return;
      }

      console.log('[DeleteHireRequest] Update result:', data);
      toast.success('Заявка перемещена в архив');
      setConfirmDelete(false);

      if (onRequestDeleted) {
        console.log('[DeleteHireRequest] Calling onRequestDeleted callback...');
        onRequestDeleted();
      }
    } catch (e) {
      console.error('[DeleteHireRequest] Exception during delete:', e);
      toast.error('Ошибка при архивации заявки');
    } finally {
      setIsDeleting(false);
      console.log('[DeleteHireRequest] Delete operation completed');
    }
  };

  return (
    <div className="relative inline-block">
      {!confirmDelete && !isDeleting && (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => {
            console.log('[DeleteHireRequest] Confirm delete toggled ON');
            setConfirmDelete(true);
          }}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}

      {confirmDelete && !isDeleting && (
        <div className="absolute right-0 top-full mt-2 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 z-50">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Удалить?
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[DeleteHireRequest] Confirm delete toggled OFF');
              setConfirmDelete(false);
            }}
          >
            Отмена
          </Button>
        </div>
      )}

      {isDeleting && (
        <span className="ml-2 text-sm text-gray-500">Удаляем...</span>
      )}
    </div>
  );
} ```

### File: ./src/components/MultiStepForm.jsx
```
'use client';
import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProgressBar } from './ProgressBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentUpload from './DocumentUpload'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const INITIAL_DATA = {
  companyName: "",
  employeeName: "",
  position: "",
  employmentType: "",
  workBook: "",
  workBookFile: null,
  passport: null,
  snils: null,
  inn: null,
  bankDetails: null
}

export default function MultiStepForm() {
  const [data, setData] = useState(INITIAL_DATA)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hireId, setHireId] = useState(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()

  // Get current user session
  const [user, setUser] = useState(null)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      
      // Проверяем пользователя в таблице users
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      
      console.log('DB user:', dbUser)
      if (dbError) console.error('DB Error:', dbError)
      
      // Используем ID из таблицы users
      setUser(dbUser || user)
    }
    getUser()
  }, [supabase])

  function updateFields(fields) {
    setData(prev => ({ ...prev, ...fields }))
  }

  // Создаем запись в hire перед загрузкой файлов
  const createHireRecord = async () => {
    const { data: hire, error } = await supabase
      .from('hire')
      .insert({
        user_id: user?.id,
        company_name: data.companyName,
        employee_name: data.employeeName,
        position: data.position,
        employment_type: data.employmentType,
        work_book_type: data.workBook,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return hire
  }

  // Проверяем наличие всех необходимых файлов
  const areAllFilesUploaded = () => {
    const requiredFiles = ['passport', 'snils', 'inn', 'bankDetails']
    if (data.workBook !== 'none') {
      requiredFiles.push('workBookFile')
    }
    
    return requiredFiles.every(fileType => data[fileType] !== null)
  }

  // Обновляем запись с URL файлов
  const updateHireRecord = async () => {
    const { error } = await supabase
      .from('hire')
      .update({ 
        status: areAllFilesUploaded() ? 'pending' : 'draft'
      })
      .eq('id', hireId)

    if (error) throw error
  }

  const steps = useMemo(() => [
    <CompanyStep key="company" {...data} updateFields={updateFields} />,
    <EmployeeNameStep key="employeeName" {...data} updateFields={updateFields} />,
    <PositionStep key="position" {...data} updateFields={updateFields} />,
    <EmploymentTypeStep key="employmentType" {...data} updateFields={updateFields} />,
    <WorkBookStep key="workBook" {...data} updateFields={updateFields} />,
    <DocumentUpload 
      key="documents"
      formData={data}
      hireId={hireId}
      onUpload={(docType, fileUrl) => {
        updateFields({
          [docType]: fileUrl
        })
      }}
      documents={[
        { type: 'passport', title: 'Паспорт', description: 'Загрузите скан или фото паспорта', required: true },
        { type: 'snils', title: 'СНИЛС', description: 'Загрузите скан или фото СНИЛС', required: true },
        { type: 'inn', title: 'ИНН', description: 'Загрузите скан или фото ИНН', required: true },
        { type: 'bankDetails', title: 'Банковские реквизиты', description: 'Загрузите файл с банковскими реквизитами', required: true },
        ...(data.workBook !== 'none' ? [{
          type: 'workBookFile',
          title: 'Трудовая книжка',
          description: `Загрузите скан ${data.workBook === 'paper' ? 'бумажной' : 'электронной'} трудовой книжки`,
          required: true
        }] : [])
      ]}
    />
  ], [data, updateFields, hireId])

  function next() {
    setCurrentStep(i => {
      if (i >= steps.length - 1) return i
      return i + 1
    })
  }

  function back() {
    setCurrentStep(i => {
      if (i <= 0) return i
      return i - 1
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (currentStep === steps.length - 2) { // Перед шагом загрузки файлов
      try {
        setLoading(true)
        const hire = await createHireRecord()
        setHireId(hire.id)
        next()
      } catch (error) {
        console.error('Error creating hire record:', error)
        toast.error('Ошибка при создании заявки')
      } finally {
        setLoading(false)
      }
    } else if (currentStep === steps.length - 1) {
      if (!areAllFilesUploaded()) {
        toast.error('Пожалуйста, загрузите все необходимые документы')
        return
      }

      try {
        setLoading(true)
        await updateHireRecord()
        toast.success('Заявка успешно отправлена')
        router.push('/dashboard')
      } catch (error) {
        console.error('Error updating hire record:', error)
        toast.error('Ошибка при отправке формы')
      } finally {
        setLoading(false)
      }
    } else {
      next()
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-platform-secondary">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit}>
          {steps[currentStep]}
          <div className="mt-6 flex justify-between">
            {currentStep !== 0 && (
              <Button 
                type="button" 
                onClick={back} 
                variant="outline"
                className="border-platform-primary text-platform-primary hover:bg-platform-primary/10"
              >
                Назад
              </Button>
            )}
            <Button 
              type="submit" 
              className={`bg-platform-primary hover:bg-platform-primary/90 text-white ${currentStep === 0 ? "ml-auto" : ""}`}
              disabled={loading || (currentStep === steps.length - 1 && !areAllFilesUploaded())}
            >
              {currentStep === steps.length - 1 ? (
                loading ? "Отправка..." : (areAllFilesUploaded() ? "Отправить" : "Загрузите все документы")
              ) : "Далее"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompanyStep({
  companyName,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Наименование компании</h2>
      <Label htmlFor="companyName">Название компании</Label>
      <Input
        autoFocus
        required
        type="text"
        id="companyName"
        value={companyName}
        onChange={e => updateFields({ companyName: e.target.value })} />
    </div>)
  );
}

function EmployeeNameStep({
  employeeName,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Имя сотрудника</h2>
      <Label htmlFor="employeeName">Имя сотрудника</Label>
      <Input
        autoFocus
        required
        type="text"
        id="employeeName"
        value={employeeName}
        onChange={e => updateFields({ employeeName: e.target.value })} />
    </div>)
  );
}

function PositionStep({
  position,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Должность сотрудника</h2>
      <Label htmlFor="position">Должность</Label>
      <Input
        autoFocus
        required
        type="text"
        id="position"
        value={position}
        onChange={e => updateFields({ position: e.target.value })} />
    </div>)
  );
}

function EmploymentTypeStep({
  employmentType,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Тип трудоустройства</h2>
      <Label htmlFor="employmentType">Выберите тип трудоустройства</Label>
      <Select
        value={employmentType}
        onValueChange={(value) => updateFields({ employmentType: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите тип трудоустройства" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full-time">Полная занятость</SelectItem>
          <SelectItem value="part-time">Частичная занятость</SelectItem>
          <SelectItem value="contract">Контракт</SelectItem>
        </SelectContent>
      </Select>
    </div>)
  );
}

function WorkBookStep({
  workBook,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Наличие трудовой книжки</h2>
      <Label htmlFor="workBook">Выберите тип трудовой книжки</Label>
      <Select
        value={workBook}
        onValueChange={(value) => updateFields({ workBook: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите тип трудовой книжки" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paper">Бумажная трудовая книжка</SelectItem>
          <SelectItem value="electronic">Электронная трудовая книжка</SelectItem>
          <SelectItem value="none">Отсутствует (Первое трудоустройство)</SelectItem>
        </SelectContent>
      </Select>
    </div>)
  );
}

```

### File: ./src/components/HireRequestsGrid.jsx
```
'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

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
  const [localRequests, setLocalRequests] = useState(requests);
  const router = useRouter();

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const handleRequestClick = (request) => {
    if (request.status === 'draft') {
      router.push(`/hire/upload/${request.id}`);
    } else {
      router.push(`/hire/${request.id}`);
    }
  };

  if (localRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">У вас пока нет заявок на трудоустройство</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {localRequests.map((request) => (
        <Card 
          key={request.id} 
          className={`shadow-lg cursor-pointer transition-transform hover:scale-[1.02] ${
            request.status === 'draft' ? 'border-dashed' : ''
          }`}
          onClick={() => handleRequestClick(request)}
        >
          <CardHeader>
            <CardTitle className="text-xl">{request.company_name}</CardTitle>
            <CardDescription>
              <span className={`inline-block px-2 py-1 rounded-full text-sm ${statusColors[request.status]}`}>
                {statusTranslations[request.status]}
              </span>
            </CardDescription>
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
  )
} ```

### File: ./src/components/DocumentUpload.jsx
```
'use client';

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Check, Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Функция для транслитерации русского текста
function transliterate(text) {
  if (!text) return '';
  
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_', '-': '_', '.': '_'
  };

  // Приводим текст к нижнему регистру перед обработкой
  return text.toLowerCase()
    .split('')
    .map(char => ru[char] || char)
    .join('');
}

// Функция для очистки строки (убирает пробелы и спецсимволы)
function sanitizePath(str) {
  if (!str) return '';
  
  const transliterated = transliterate(str);
  return transliterated
    .replace(/[^a-z0-9_]/g, '_') // оставляем только латинские буквы, цифры и _
    .replace(/_+/g, '_') // убираем множественные _
    .replace(/^_|_$/g, '') // убираем _ в начале и конце
    || 'file'; // если строка пустая, используем 'file'
}

export default function DocumentUpload({ documents, onUpload, formData, hireId, existingFiles = {} }) {
  const [uploading, setUploading] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Инициализируем состояние uploadedFiles с existingFiles при монтировании
  useEffect(() => {
    setUploadedFiles(existingFiles);
  }, [existingFiles]);

  const uploadFile = async (file, docType) => {
    try {
      setUploading(prev => ({ ...prev, [docType]: true }))

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Пользователь не авторизован')

      // Формируем путь для файла
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const docTitle = sanitizePath(documents.find(d => d.type === docType).title)
      const fileName = `${docTitle}_${timestamp}.${fileExtension}`
      
      // Очищаем и проверяем все части пути
      const pathParts = [
        user.id,
        hireId,
        sanitizePath(formData.companyName || 'company'),
        sanitizePath(formData.employeeName || 'employee'),
        docTitle,
        fileName
      ];

      // Проверяем, что все части пути валидны
      if (pathParts.some(part => !part)) {
        throw new Error('Некорректный путь файла')
      }

      const filePath = pathParts.join('/')
      console.log('Uploading file to path:', filePath)

      // Загружаем файл
      const { error: uploadError, data } = await supabase.storage
        .from('hire')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Получаем публичную ссылку на файл
      const { data: { publicUrl } } = supabase.storage
        .from('hire')
        .getPublicUrl(filePath)

      // Сохраняем информацию о загруженном файле
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: {
          name: file.name,
          url: publicUrl,
          timestamp: new Date().toLocaleString()
        }
      }))

      onUpload(docType, publicUrl)
      toast.success(`${documents.find(d => d.type === docType).title} успешно загружен`)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(`Ошибка при загрузке ${documents.find(d => d.type === docType).title}`)
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }))
    }
  }

  const removeFile = (docType) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[docType]
      return newFiles
    })
    onUpload(docType, null)
  }

  const onDrop = useCallback((acceptedFiles, docType) => {
    if (acceptedFiles?.[0]) {
      uploadFile(acceptedFiles[0], docType)
    }
  }, [])

  if (!hireId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка: ID заявки не найден</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {documents.map(({ type, title, description }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop: (files) => onDrop(files, type),
          maxFiles: 1,
          multiple: false,
          accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
          }
        })

        const uploadedFile = uploadedFiles[type]

        return (
          <div key={type} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {title}
              {uploadedFile && (
                <span className="ml-2 text-sm text-green-600">✓ Загружено</span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            
            {uploadedFile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      {uploadedFile.timestamp && (
                        <p className="text-xs text-gray-500">Загружено: {uploadedFile.timestamp}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <input {...getInputProps()} />
                {uploading[type] ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-5 h-5 animate-bounce" />
                    <p className="text-gray-500">Загрузка...</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-blue-500">Перетащите файл сюда</p>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-gray-500">
                      Перетащите файл сюда или кликните для выбора
                    </p>
                    <p className="text-xs text-gray-400">
                      Поддерживаемые форматы: PDF, PNG, JPG, JPEG
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

```

### File: ./src/components/SideMenu.jsx
```
"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function SideMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!isAuthenticated) return null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-background">
        <nav className="flex flex-col h-full">
          <div className="flex-1 py-8 space-y-2">
            <Link href="/dashboard">
              <Button 
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                Мои заявки
              </Button>
            </Link>
            <Link href="/hire">
              <Button 
                variant={pathname === "/hire" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                Оформление сотрудника
              </Button>
            </Link>
          </div>
          <div className="py-4 border-t">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSignOut}
            >
              Выйти
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
} ```

### File: ./src/components/DocumentPreview.jsx
```
'use client';

import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function DocumentPreview({ file, request }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.group(`DocumentPreview: file "${file?.name}"`);
  console.log('file object:', file);
  console.log('request:', request);
  console.groupEnd();

  const getFileUrl = async () => {
    const pathParts = [
      request.user_id,
      request.id,
      file.name
    ];

    const path = pathParts.join('/');
    console.log('[DocumentPreview] Getting public URL for path:', path);
    console.log('[DocumentPreview] Path parts:', pathParts);

    const { data, error } = supabase.storage
      .from('hire')
      .getPublicUrl(path);

    if (error) {
      console.error('[DocumentPreview] Error getting public URL:', error);
      return null;
    }

    console.log('[DocumentPreview] Public URL data:', data);
    return data.publicUrl;
  };

  const handleOpenClick = async () => {
    console.log('[DocumentPreview] handleOpenClick triggered');
    const url = await getFileUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('[DocumentPreview] Failed to get file URL');
    }
  };

  return (
    <div className="flex items-center p-3 border rounded-lg">
      <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
      <span className="flex-1 truncate">{file.name}</span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenClick}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} ```

### File: ./src/components/ProgressBar.jsx
```
import { Progress } from "@/components/ui/progress"

export function ProgressBar({
  currentStep,
  totalSteps
}) {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-white text-sm">
        <span>Шаг {currentStep + 1} из {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-white/20" 
        indicatorClassName="bg-platform-primary" 
      />
    </div>
  );
}

```

### File: ./src/middleware.js
```
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} ```

### File: ./src/lib/supabase.js
```
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
} ```

### File: ./src/lib/utils.js
```
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

## Skipping './supabase': not found or not a regular file/directory

## File: ./middleware.ts

### File: ./middleware.ts
```
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Публичные маршруты, которые не требуют авторизации
const publicRoutes = [
  '/login',
  '/auth/callback',
  '/auth-error',
  '/api/auth',  // Для Supabase Auth endpoints
  '/_next',     // Для Next.js статических ресурсов
  '/static',    // Для статических файлов
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Проверяем, является ли текущий путь публичным
  const isPublicPath = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isPublicPath) {
    return res
  }

  // Получаем сессию
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Если нет сессии, редиректим на логин
  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    // Сохраняем URL, с которого пришли, чтобы вернуться после логина
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} ```

## Skipping './next.config.js': not found or not a regular file/directory

## File: ./package.json

## Skipping './tsconfig.json': not found or not a regular file/directory

## Skipping './vercel.json': not found or not a regular file/directory


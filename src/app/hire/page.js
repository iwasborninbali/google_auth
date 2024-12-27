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
} 
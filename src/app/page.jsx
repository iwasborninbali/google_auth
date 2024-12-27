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


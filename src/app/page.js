export default function Home() {
  return (
    <div>
      <header>
        <a href="/" className="logo">PLATFORM AI</a>
        <nav>
          <a href="#about">О нас</a>
          <a href="#contact">Контакты</a>
          <a href="/login" className="btn-primary" style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
            Войти
          </a>
        </nav>
      </header>

      <main>
        <section className="bg-light" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1>Привет, мир!</h1>
          <p className="text-secondary" style={{ maxWidth: '600px', margin: '1rem auto' }}>
            Добро пожаловать в мир инновационных решений PLATFORM AI. 
            Мы создаем будущее вместе с вами.
          </p>
          <button className="btn-primary mt-1">Начать сейчас</button>
        </section>

        <section id="about" style={{ padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="text-primary">О нас</h2>
            <p>
              PLATFORM AI - это передовая компания в области искусственного интеллекта и 
              инновационных технологий. Мы стремимся сделать технологии доступными для всех.
            </p>
          </div>
        </section>

        <section id="contact" className="bg-light" style={{ padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2>Свяжитесь с нами</h2>
            <p className="mb-1">
              Готовы обсудить ваш проект? Мы всегда на связи.
            </p>
            <button className="btn-accent">Написать нам</button>
          </div>
        </section>
      </main>

      <footer>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" className="logo">PLATFORM AI</a>
          <p style={{ fontSize: '0.875rem' }}>© 2023 PLATFORM AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

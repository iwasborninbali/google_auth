import Auth from '@/components/Auth'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="text-4xl font-bold mb-8">Welcome to Our App</h1>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
          <Auth />
        </div>
      </main>
    </div>
  )
}

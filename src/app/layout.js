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

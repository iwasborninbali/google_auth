import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { SideMenu } from "@/components/SideMenu"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Best Consulting system",
  description: "Система управления заявками на трудоустройство",
}

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {session && <SideMenu />}
        <div className="fixed top-0 right-0 p-2 text-xs">
          Session: {session ? 'Active' : 'None'}
        </div>
        {children}
      </body>
    </html>
  )
}

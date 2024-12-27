import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function SideMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed left-4 top-4">
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
} 
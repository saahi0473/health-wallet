"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  AlertCircle,
  User,
  Menu,
  X,
  Activity,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sessionStorage as appSession } from "@/lib/user-management"
import { toast } from "sonner"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/emergency", label: "Emergency", icon: AlertCircle },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    appSession.clearSession()
    toast.success("Signed out successfully")
    router.push("/auth/signin")
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="p-1.5 gradient-health rounded-lg">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-base">Health Wallet</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-sidebar z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 gradient-health rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Health Wallet</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "sidebar-active"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Bottom nav bar for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

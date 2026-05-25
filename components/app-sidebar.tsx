"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Calendar,
  AlertCircle,
  User,
  LogOut,
  Activity,
  Heart,
  Settings,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { sessionStorage as appSession } from "@/lib/user-management"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "My Documents", icon: FileText },
  { href: "/documents?filter=favorites", label: "Favorites", icon: Star },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/emergency", label: "Emergency Profile", icon: AlertCircle },
  { href: "/profile", label: "Profile", icon: User },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: (collapsed: boolean) => void
}

export function AppSidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<ReturnType<typeof appSession.getSession>>(null)
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  useEffect(() => {
    setSession(appSession.getSession())
  }, [])

  const handleToggle = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onToggle?.(next)
  }

  const handleLogout = () => {
    appSession.clearSession()
    toast.success("Signed out successfully")
    router.push("/auth/signin")
  }

  const initials = session
    ? `${session.firstName[0]}${session.lastName[0]}`.toUpperCase()
    : "U"

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href.split("?")[0])
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-border bg-sidebar sticky top-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-border", isCollapsed && "justify-center")}>
        <div className="p-1.5 gradient-health rounded-lg flex-shrink-0">
          <Activity className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight">Health Wallet</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link key={`${href}-${label}`} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer group",
                  active
                    ? "sidebar-active"
                    : "text-sidebar-foreground/70 hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn("h-5 w-5 flex-shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                />
                {!isCollapsed && <span>{label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-2 border-t border-border space-y-1">
        <Link href="/settings">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </div>
        </Link>

        {/* User info */}
        {!isCollapsed && session && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="gradient-health text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">
                {session.firstName} {session.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{session.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl",
            isCollapsed ? "px-2 justify-center" : "justify-start gap-3 px-3"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-20 p-1 bg-card border border-border rounded-full shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  )
}

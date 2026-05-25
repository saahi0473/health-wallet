"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      router.push("/auth/signin")
    }
  }, [router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 gradient-health rounded-2xl animate-pulse">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your health wallet...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav />
        <main
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin",
            "transition-all duration-300"
          )}
        >
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Activity } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { onAuthChange } from "@/lib/firebase-auth"
import type { User } from "firebase/auth"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [user, setUser] = useState<User | null | "loading">("loading")
  const router = useRouter()

  useEffect(() => {
    // Firebase onAuthStateChanged — real auth listener
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) {
        router.push("/auth/signin")
      }
    })
    return () => unsubscribe() // cleanup on unmount
  }, [router])

  if (user === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 gradient-health rounded-2xl">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your health wallet...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  )
}

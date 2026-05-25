"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/firebase-auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Please enter your email"); return }
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Failed to send reset email. Try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="p-3 gradient-health rounded-2xl w-fit mx-auto mb-4">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Reset your password</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your email and we&apos;ll send a reset link via Firebase
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground">Email sent!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check <strong>{email}</strong> for the reset link.
              </p>
            </div>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" />
            </div>
            <Button type="submit" className="w-full gradient-health text-white h-11 font-semibold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Reset Link"}
            </Button>
            <Link href="/auth/signin">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </Button>
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}

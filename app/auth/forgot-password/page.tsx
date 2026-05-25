"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { userStorage } from "@/lib/user-management"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address")
      return
    }

    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))

    // In a real app this would send an email; here we just simulate it
    const user = userStorage.findUserByEmail(email.trim().toLowerCase())
    // Show same success message whether user exists or not (security best practice)
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="p-2.5 gradient-health rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Health Wallet</span>
        </div>

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Forgot your password?</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-health text-white font-semibold h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-2">
              We&apos;ve sent a password reset link to
            </p>
            <p className="font-semibold text-foreground mb-6">{email}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

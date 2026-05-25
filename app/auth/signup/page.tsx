"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/firebase-auth"
import { toast } from "sonner"

function strengthLabel(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return { score: s, label: ["", "Weak", "Fair", "Good", "Strong"][s], color: ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"][s] }
}

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const strength = strengthLabel(form.password)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = "Required"
    if (!form.lastName.trim()) e.lastName = "Required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required"
    if (form.password.length < 8) e.password = "Min 8 characters"
    if (form.password !== form.confirm) e.confirm = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setIsLoading(true)
    try {
      await registerUser(form.email, form.password, form.firstName, form.lastName)
      toast.success("Account created! Welcome to Health Wallet 🎉")
      router.push("/")
    } catch (err: any) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : "Sign up failed. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-health flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="p-4 bg-white/20 rounded-2xl w-fit mx-auto mb-6">
            <Activity className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join Health Wallet</h1>
          <p className="text-white/80 text-lg">
            Create your free account and start organizing your health records securely in the cloud.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {["Real Firebase authentication", "Files stored in Firebase Cloud Storage", "Data syncs across all your devices", "Your data is private and secure"].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/10 rounded-xl p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <div className="lg:hidden p-3 gradient-health rounded-2xl w-fit mx-auto mb-4">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground mt-1 text-sm">Free forever · No credit card needed</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fn">First name</Label>
                <Input id="fn" value={form.firstName} onChange={set("firstName")} placeholder="Alex"
                  className={errors.firstName ? "border-destructive" : ""} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="ln">Last name</Label>
                <Input id="ln" value={form.lastName} onChange={set("lastName")} placeholder="Smith"
                  className={errors.lastName ? "border-destructive" : ""} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")}
                placeholder="you@example.com" className={errors.email ? "border-destructive" : ""} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input id="pw" type={showPw ? "text" : "password"} value={form.password}
                  onChange={set("password")} placeholder="Min 8 characters" className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="conf">Confirm password</Label>
              <Input id="conf" type="password" value={form.confirm} onChange={set("confirm")}
                placeholder="Repeat password" className={errors.confirm ? "border-destructive" : ""} />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>

            <Button type="submit" className="w-full gradient-health text-white h-11 font-semibold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

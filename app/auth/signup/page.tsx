"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Activity, Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"
import { userStorage, sessionStorage as appSession } from "@/lib/user-management"
import { toast } from "sonner"

const passwordStrength = (pw: string) => {
  if (pw.length === 0) return { score: 0, label: "", color: "" }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Weak", color: "bg-red-400" },
    2: { label: "Fair", color: "bg-amber-400" },
    3: { label: "Good", color: "bg-yellow-400" },
    4: { label: "Strong", color: "bg-emerald-400" },
  }
  return { score, ...map[score] }
}

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const strength = passwordStrength(password)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = "First name is required"
    if (!lastName.trim()) e.lastName = "Last name is required"
    if (!email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email"
    if (!password) e.password = "Password is required"
    else if (password.length < 8) e.password = "Password must be at least 8 characters"
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 700))

    const existing = userStorage.findUserByEmail(email.trim().toLowerCase())
    if (existing) {
      setErrors({ email: "An account with this email already exists" })
      setIsLoading(false)
      return
    }

    const newUser = userStorage.saveUser({
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password,
    })

    appSession.createSession(newUser, false)
    toast.success(`Account created! Welcome to Health Wallet, ${firstName}! 🎉`)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-health relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Health Wallet</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Start your health
                <br />
                <span className="text-white/80">journey today.</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-md">
                Join thousands who trust Health Wallet to keep their medical records secure, organized and accessible.
              </p>
            </div>
            <div className="space-y-4">
              {[
                "Free forever for personal use",
                "Secure & encrypted storage",
                "Share with one tap",
                "Emergency health profile",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white/80 flex-shrink-0" />
                  <span className="text-white/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/50 text-sm">© 2025 Health Wallet. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 gradient-health rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Health Wallet</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Set up your free Health Wallet in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Johnson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

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
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <Button
              type="submit"
              className="w-full gradient-health text-white font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

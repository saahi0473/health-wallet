"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Activity, Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Zap, Heart } from "lucide-react"
import { userStorage, sessionStorage as appSession } from "@/lib/user-management"
import { toast } from "sonner"

const features = [
  { icon: Shield, text: "Bank-level encryption" },
  { icon: Zap, text: "Instant document access" },
  { icon: Heart, text: "Emergency health profile" },
]

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  useEffect(() => {
    const remembered = appSession.getRememberedEmail()
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
    if (appSession.isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email"
    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    // Simulate API delay for realism
    await new Promise((r) => setTimeout(r, 800))

    const user = userStorage.validateCredentials(email.trim().toLowerCase(), password)
    if (!user) {
      setErrors({ general: "Invalid email or password. Please try again." })
      setIsLoading(false)
      return
    }

    appSession.createSession(user, rememberMe)
    toast.success(`Welcome back, ${user.firstName}! 👋`)
    router.push("/")
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    // Create a demo user if doesn't exist
    let demoUser = userStorage.findUserByEmail("demo@healthwallet.app")
    if (!demoUser) {
      demoUser = userStorage.saveUser({
        email: "demo@healthwallet.app",
        firstName: "Alex",
        lastName: "Demo",
        password: "demo123",
      })
    }
    await new Promise((r) => setTimeout(r, 600))
    appSession.createSession(demoUser, false)
    toast.success("Signed in as demo user!")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-health relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Activity className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Health Wallet</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Your health records,
                <br />
                <span className="text-white/80">always with you.</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-md">
                Securely store, organize and share your medical documents with doctors and family — all in one place.
              </p>
            </div>

            <div className="space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-white/90 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/50 text-sm">© 2025 Health Wallet. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="p-2 gradient-health rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Health Wallet</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your health records</p>
          </div>

          {/* Demo Login Banner */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">
              🎯 Want to explore without signing up?
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-primary/30 text-primary hover:bg-primary/5"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Try Demo Account
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {errors.general}
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
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full gradient-health text-white font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

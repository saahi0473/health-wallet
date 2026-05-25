"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Shield,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { sessionStorage as appSession, userStorage, type User as UserType } from "@/lib/user-management"
import { documentStorage } from "@/lib/document-management"
import { appointmentStorage } from "@/lib/health-data"
import { toast } from "sonner"
import { format } from "date-fns"

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileContent />
    </AppShell>
  )
}

function ProfileContent() {
  const [session, setSession] = useState(appSession.getSession())
  const [user, setUser] = useState<UserType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  // Profile fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  // Password change
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError] = useState("")

  // Stats
  const [totalDocs, setTotalDocs] = useState(0)
  const [totalApts, setTotalApts] = useState(0)
  const [memberSince, setMemberSince] = useState("")

  useEffect(() => {
    const s = appSession.getSession()
    setSession(s)
    if (s) {
      const u = userStorage.findUserByEmail(s.email)
      if (u) {
        setUser(u)
        setFirstName(u.firstName)
        setLastName(u.lastName)
        setPhone(u.phone || "")
        setMemberSince(format(new Date(u.createdAt), "MMMM yyyy"))
      }
      setTotalDocs(documentStorage.getUserDocuments(s.email).length)
      setTotalApts(appointmentStorage.getUserAppointments(s.email).length)
    }
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))

    const updated = userStorage.updateUser(user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    })

    if (updated) {
      setUser(updated)
      appSession.updateSession({ firstName: updated.firstName, lastName: updated.lastName })
      setSession(appSession.getSession())
      toast.success("Profile updated successfully!")
    }
    setIsSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    if (!user) return

    if (user.password !== currentPw) {
      setPwError("Current password is incorrect")
      return
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters")
      return
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords don't match")
      return
    }

    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    userStorage.updateUser(user.id, { password: newPw })
    setCurrentPw("")
    setNewPw("")
    setConfirmPw("")
    setIsSaving(false)
    toast.success("Password changed successfully!")
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile card */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="gradient-health text-white text-2xl font-bold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground">
                {firstName} {lastName}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">{session?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Member since {memberSince}</p>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold text-foreground">{totalDocs}</p>
                  <p className="text-xs text-muted-foreground">Documents</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold text-foreground">{totalApts}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={session?.email || ""}
                  disabled
                  className="pl-10 bg-muted/50 text-muted-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  placeholder="+1 555 000 0000"
                  type="tel"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="gradient-health text-white gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {pwError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPw">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPw"
                  type={showNewPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPw"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="pl-10"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="outline" className="gap-2" disabled={isSaving}>
                <Shield className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

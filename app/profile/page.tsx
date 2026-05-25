"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import {
  User,
  Mail,
  Phone,
  Save,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { auth } from "@/lib/firebase"
import { onAuthChange, getUserProfile, updateUserProfile } from "@/lib/firebase-auth"
import { getUserDocuments, getUserAppointments } from "@/lib/firebase-db"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth"
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
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
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
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUserId(user.uid)
        setUserEmail(user.email || "")
        try {
          const profile = await getUserProfile(user.uid)
          if (profile) {
            setFirstName(profile.firstName)
            setLastName(profile.lastName)
            setPhone(profile.phone || "")
            setMemberSince(format(new Date(profile.createdAt), "MMMM yyyy"))
          } else {
            // Fallback to Firebase auth details
            const names = (user.displayName || "User").split(" ")
            setFirstName(names[0] || "")
            setLastName(names.slice(1).join(" ") || "")
            setMemberSince(format(new Date(), "MMMM yyyy"))
          }

          // Fetch Stats
          const docs = await getUserDocuments(user.uid)
          const apts = await getUserAppointments(user.uid)
          setTotalDocs(docs.length)
          setTotalApts(apts.length)
        } catch (err) {
          console.error("Error loading profile stats:", err)
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setIsSaving(true)

    try {
      // Step 1: Update Extra Info in Firestore
      await updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      })

      // Step 2: Update display name in Firebase Auth
      const firebaseUser = auth.currentUser
      if (firebaseUser) {
        await updateProfile(firebaseUser, {
          displayName: `${firstName.trim()} ${lastName.trim()}`,
        })
      }

      toast.success("Profile details saved successfully! 👤")
    } catch (err) {
      toast.error("Failed to update profile details.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    const user = auth.currentUser
    if (!user || !user.email) return

    if (!currentPw) {
      setPwError("Current password is required")
      return
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters")
      return
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match")
      return
    }

    setIsSaving(true)
    try {
      // Reauthenticate user before password update (Firebase requirement)
      const credential = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPw)

      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
      toast.success("Password changed successfully! 🔐")
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setPwError("Current password is incorrect")
      } else {
        setPwError(err.message || "Failed to update password")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

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
              <p className="text-muted-foreground text-sm mt-0.5">{userEmail}</p>
              {memberSince && <p className="text-xs text-muted-foreground mt-1">Member since {memberSince}</p>}

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
                  value={userEmail}
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
                  placeholder="Min 6 characters"
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

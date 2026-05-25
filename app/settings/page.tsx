"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import {
  Bell,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Settings,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { onAuthChange, logoutUser, getUserProfile } from "@/lib/firebase-auth"
import { getUserDocuments, deleteDocument } from "@/lib/firebase-db"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  )
}

function SettingsContent() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [dataSharing, setDataSharing] = useState(false)
  const [userId, setUserId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUserId(user.uid)
        setUserEmail(user.email || "")
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleExportData = async () => {
    if (!userId) return

    try {
      const docs = await getUserDocuments(userId)
      const profile = await getUserProfile(userId)
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: profile || { email: userEmail },
        documents: docs.map(({ fileUrl, ...d }) => d), // export metadata
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `health-wallet-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully! 📥")
    } catch (err) {
      toast.error("Failed to export data")
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your data and sign out? This action cannot be undone."
    )
    if (!confirmed) return

    if (!userId) return
    setIsDeleting(true)

    try {
      // Fetch and delete all user documents
      const docs = await getUserDocuments(userId)
      for (const doc of docs) {
        await deleteDocument(doc.id, doc.storagePath)
      }

      // Log out user
      await logoutUser()
      toast.success("Account data cleared and logged out successfully.")
      router.push("/auth/signin")
    } catch (err) {
      toast.error("Error deleting user data. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and account settings</p>
      </div>

      {/* Notifications */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get notified about upcoming appointments
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Alerts</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receive email summaries and reminders
              </p>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={(v) => {
                setTwoFactor(v)
                toast.info("2FA setup requires Multi-Factor Authentication configuration in Production console.")
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Anonymous Data Sharing</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Help improve the app with anonymized usage data
              </p>
            </div>
            <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>Export or manage your stored health data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            Export All Data (JSON)
          </Button>
          <p className="text-xs text-muted-foreground">
            Downloads all your document metadata and profile data as a JSON file.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 gap-2"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting Data...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete My Data & Sign Out
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will permanently delete all uploaded documents and scheduled appointments.
          </p>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-border/60">
        <CardContent className="p-5 text-center">
          <p className="text-sm font-semibold text-foreground">Health Wallet</p>
          <p className="text-xs text-muted-foreground mt-0.5">Version 1.0.0 • Built with Firebase Full-Stack</p>
          <p className="text-xs text-muted-foreground mt-3">
            © 2026 Health Wallet. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

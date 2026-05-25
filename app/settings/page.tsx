"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Moon,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Settings,
  Eye,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { sessionStorage as appSession } from "@/lib/user-management"
import { documentStorage } from "@/lib/document-management"
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

  const handleExportData = () => {
    const session = appSession.getSession()
    if (!session) return

    const docs = documentStorage.getUserDocuments(session.email, true)
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: { email: session.email, firstName: session.firstName, lastName: session.lastName },
      documents: docs.map(({ fileDataUrl, ...d }) => d), // exclude any base64 data
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `health-wallet-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    if (!confirmed) return

    const session = appSession.getSession()
    if (session) {
      // Remove all user data
      const docs = documentStorage.getUserDocuments(session.email, true)
      docs.forEach((d) => documentStorage.deleteDocument(d.id))

      // Clear user from storage
      const users = JSON.parse(localStorage.getItem("healthwallet_users") || "[]")
      const filtered = users.filter((u: { email: string }) => u.email !== session.email)
      localStorage.setItem("healthwallet_users", JSON.stringify(filtered))
      localStorage.removeItem(`healthwallet_emergency_${session.email}`)
    }

    appSession.clearSession()
    toast.success("Account deleted")
    router.push("/auth/signin")
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
                toast.info("2FA setup would require email/phone verification in production")
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
          >
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will permanently delete your account and all associated data.
          </p>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-border/60">
        <CardContent className="p-5 text-center">
          <p className="text-sm font-semibold text-foreground">Health Wallet</p>
          <p className="text-xs text-muted-foreground mt-0.5">Version 1.0.0 • Built for your health</p>
          <p className="text-xs text-muted-foreground mt-3">
            © 2025 Health Wallet. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  FileText,
  Calendar,
  Heart,
  Activity,
  Star,
  TrendingUp,
  Clock,
  ArrowRight,
  Upload,
  AlertCircle,
  Pill,
  TestTube,
  Stethoscope,
  Image,
  Shield,
  Receipt,
  FolderOpen,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { AddDocumentModal } from "@/components/add-document-modal"
import { documentStorage, DOCUMENT_CATEGORIES, type Document, type DocumentCategory } from "@/lib/document-management"
import { sessionStorage as appSession } from "@/lib/user-management"
import { appointmentStorage, type Appointment } from "@/lib/health-data"
import { formatDistanceToNow, format } from "date-fns"

const categoryIcons: Record<DocumentCategory, React.ComponentType<{ className?: string }>> = {
  prescription: Pill,
  "lab-report": TestTube,
  "medical-record": Stethoscope,
  imaging: Image,
  vaccination: Shield,
  insurance: Shield,
  bills: Receipt,
  other: FolderOpen,
}

const categoryColors: Record<DocumentCategory, string> = {
  prescription: "bg-blue-500",
  "lab-report": "bg-emerald-500",
  "medical-record": "bg-purple-500",
  imaging: "bg-rose-500",
  vaccination: "bg-orange-500",
  insurance: "bg-cyan-500",
  bills: "bg-amber-500",
  other: "bg-gray-500",
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  color?: "primary" | "accent" | "emerald" | "rose"
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    emerald: "text-emerald-600 bg-emerald-100",
    rose: "text-rose-600 bg-rose-100",
  }

  return (
    <Card className="card-hover border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <Badge variant="secondary" className="text-xs font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
          <p className="text-sm font-medium text-foreground/80">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentCard({ doc }: { doc: Document }) {
  const Icon = categoryIcons[doc.type] || FileText
  const colorClass = categoryColors[doc.type] || "bg-gray-500"
  const catInfo = DOCUMENT_CATEGORIES[doc.type]

  return (
    <Link href={`/documents/${doc.id}`}>
      <Card className="doc-card border-border/60 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-2.5 rounded-xl ${colorClass}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {doc.isFavorite && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{doc.title}</h3>
          <Badge variant="secondary" className="text-xs mb-2">
            {catInfo?.label || doc.type}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
          </div>
          {doc.doctor && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{doc.doctor}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function AppointmentItem({ apt }: { apt: Appointment }) {
  const date = new Date(apt.date + " " + apt.time)
  const isToday = new Date().toDateString() === date.toDateString()

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="flex flex-col items-center justify-center w-10 text-center flex-shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase">
          {format(date, "MMM")}
        </span>
        <span className="text-lg font-bold text-foreground leading-tight">
          {format(date, "d")}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{apt.title}</p>
        <p className="text-xs text-muted-foreground truncate">{apt.doctor}</p>
        {apt.hospital && (
          <p className="text-xs text-muted-foreground truncate">{apt.hospital}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-foreground">{apt.time}</p>
        {isToday && (
          <Badge className="text-[10px] bg-primary/10 text-primary border-0 mt-1">Today</Badge>
        )}
      </div>
    </div>
  )
}

function DashboardContent() {
  const [showAddDocument, setShowAddDocument] = useState(false)
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [favoriteDocs, setFavoriteDocs] = useState(0)
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({})
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("")
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting("Good morning")
    else if (h < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    const session = appSession.getSession()
    if (session) {
      setUserName(session.firstName)
      setUserEmail(session.email)
      loadData(session.email)
    }
  }, [])

  const loadData = (email: string) => {
    const docs = documentStorage.getUserDocuments(email)
    const recent = docs.slice(0, 4)
    const favorites = docs.filter((d) => d.isFavorite)
    const stats = documentStorage.getCategoryStats(email)
    const apts = appointmentStorage.getUpcomingAppointments(email, 3)

    setRecentDocs(recent)
    setTotalDocs(docs.length)
    setFavoriteDocs(favorites.length)
    setCategoryStats(stats)
    setUpcomingApts(apts)
  }

  const handleDocumentAdded = () => {
    if (userEmail) loadData(userEmail)
  }

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalDocs === 0
              ? "Start by uploading your first health document"
              : `You have ${totalDocs} document${totalDocs !== 1 ? "s" : ""} stored securely`}
          </p>
        </div>
        <Button
          size="lg"
          className="gradient-health text-white font-semibold gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
          onClick={() => setShowAddDocument(true)}
        >
          <Plus className="h-5 w-5" />
          Upload Document
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          title="Total Documents"
          value={totalDocs}
          subtitle="Securely stored"
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingApts.length}
          subtitle="Scheduled visits"
          icon={Calendar}
          color="accent"
        />
        <StatCard
          title="Favourites"
          value={favoriteDocs}
          subtitle="Marked important"
          icon={Star}
          color="rose"
        />
        <StatCard
          title="Categories"
          value={Object.keys(categoryStats).length}
          subtitle="Document types"
          icon={FolderOpen}
          color="emerald"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Documents</h2>
            <Link href="/documents">
              <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentDocs.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {recentDocs.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-2xl mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No documents yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-48">
                  Upload your first health document to get started
                </p>
                <Button
                  size="sm"
                  className="gradient-health text-white"
                  onClick={() => setShowAddDocument(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Appointments
                </CardTitle>
                <Link href="/appointments">
                  <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingApts.length > 0 ? (
                <div className="space-y-1">
                  {upcomingApts.map((apt) => (
                    <AppointmentItem key={apt.id} apt={apt} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Plus className="h-3 w-3" />
                      Schedule
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {topCategories.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Document Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {topCategories.map(([category, count]) => {
                  const catInfo = DOCUMENT_CATEGORIES[category as DocumentCategory]
                  const pct = Math.round((count / totalDocs) * 100)
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">
                          {catInfo?.label || category}
                        </span>
                        <span className="text-foreground font-semibold">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Emergency Profile CTA */}
          <Card className="border-border/60 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/20 dark:to-orange-950/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Emergency Profile</h3>
                  <p className="text-xs text-muted-foreground">Quick access for emergencies</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Store blood type, allergies, and emergency contacts for critical situations.
              </p>
              <Link href="/emergency">
                <Button
                  size="sm"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-1"
                >
                  <Heart className="h-3.5 w-3.5" />
                  Set Up Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddDocumentModal
        open={showAddDocument}
        onOpenChange={setShowAddDocument}
        onDocumentAdded={handleDocumentAdded}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}

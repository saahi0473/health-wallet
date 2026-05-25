"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Download,
  Share2,
  Calendar,
  User,
  Building,
  FileText,
  Tag,
  Clock,
  Pill,
  TestTube,
  Stethoscope,
  Image,
  Shield,
  Receipt,
  FolderOpen,
  Eye,
} from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { documentStorage, DOCUMENT_CATEGORIES, type Document, type DocumentCategory } from "@/lib/document-management"
import { format, formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | undefined | null
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <div className="p-2 bg-muted rounded-lg flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  )
}

function DocumentDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    const found = documentStorage.getDocumentById(id)
    setDoc(found)
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="animate-pulse text-muted-foreground">Loading document...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Document not found</h2>
        <p className="text-muted-foreground mb-4">This document may have been deleted.</p>
        <Link href="/documents">
          <Button>Back to Documents</Button>
        </Link>
      </div>
    )
  }

  const Icon = categoryIcons[doc.type] || FileText
  const colorClass = categoryColors[doc.type] || "bg-gray-500"
  const catInfo = DOCUMENT_CATEGORIES[doc.type]

  const handleToggleFavorite = () => {
    const updated = documentStorage.toggleFavorite(doc.id)
    if (updated) {
      setDoc(updated)
      toast.success(updated.isFavorite ? "Added to favorites" : "Removed from favorites")
    }
  }

  const handleArchive = () => {
    const updated = documentStorage.toggleArchive(doc.id)
    if (updated) {
      setDoc(updated)
      toast.success(updated.isArchived ? "Document archived" : "Document unarchived")
    }
  }

  const handleDelete = () => {
    documentStorage.deleteDocument(doc.id)
    toast.success("Document deleted")
    router.push("/documents")
  }

  const handleDownload = () => {
    // In a real app, this would download from cloud storage
    toast.info("Download feature requires cloud storage integration")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: doc.title,
        text: `Health Document: ${doc.title}`,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-5xl mx-auto animate-fade-in">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/documents">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleToggleFavorite}
          >
            <Star className={cn("h-4 w-4", doc.isFavorite ? "text-amber-400 fill-amber-400" : "")} />
            <span className="hidden sm:inline">
              {doc.isFavorite ? "Unfavorite" : "Favorite"}
            </span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-500 hover:text-red-600 hover:border-red-300"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Header Card */}
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl ${colorClass} flex-shrink-0`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h1 className="text-xl font-bold text-foreground leading-tight">{doc.title}</h1>
                    {doc.isFavorite && (
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400 flex-shrink-0" />
                    )}
                  </div>
                  <Badge className="mb-3">{catInfo?.label || doc.type}</Badge>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File preview placeholder */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Document Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-xl flex flex-col items-center justify-center h-64 gap-3 border-2 border-dashed border-border">
                <div className={`p-4 rounded-xl ${colorClass}/10`}>
                  <Icon className={`h-10 w-10 ${colorClass.replace("bg-", "text-")}`} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">{doc.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.fileType.includes("pdf") ? "PDF Document" : "Image File"} •{" "}
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download to view
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Connect cloud storage to enable in-browser preview
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Document Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DetailRow
                icon={Calendar}
                label="Document Date"
                value={format(new Date(doc.date || doc.uploadedAt), "MMMM d, yyyy")}
              />
              <DetailRow icon={User} label="Doctor / Provider" value={doc.doctor} />
              <DetailRow icon={Building} label="Hospital / Clinic" value={doc.hospital} />
              <DetailRow icon={FileText} label="File Name" value={doc.fileName} />
              <DetailRow
                icon={Clock}
                label="Uploaded"
                value={formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
              />
              <DetailRow
                icon={FolderOpen}
                label="File Size"
                value={`${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
              />
            </CardContent>
          </Card>

          {/* Archive card */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              <Button
                variant="outline"
                className="w-full gap-2 text-muted-foreground"
                onClick={handleArchive}
              >
                <Archive className="h-4 w-4" />
                {doc.isArchived ? "Unarchive Document" : "Archive Document"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DocumentDetailPage() {
  return (
    <AppShell>
      <DocumentDetailContent />
    </AppShell>
  )
}

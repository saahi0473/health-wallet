"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  Search,
  Plus,
  Grid3X3,
  List,
  FileText,
  Star,
  Trash2,
  Archive,
  Eye,
  Calendar,
  User,
  X,
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
import {
  getUserDocuments,
  toggleFavorite,
  toggleArchive,
  deleteDocument,
  DOCUMENT_CATEGORIES,
  type HealthDocument,
  type DocumentCategory,
} from "@/lib/firebase-db"
import { onAuthChange } from "@/lib/firebase-auth"
import { formatDistanceToNow, format } from "date-fns"
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

const categoryColorMap: Record<DocumentCategory, string> = {
  prescription: "bg-blue-500",
  "lab-report": "bg-emerald-500",
  "medical-record": "bg-purple-500",
  imaging: "bg-rose-500",
  vaccination: "bg-orange-500",
  insurance: "bg-cyan-500",
  bills: "bg-amber-500",
  other: "bg-gray-500",
}

function DocumentGridCard({
  doc,
  onToggleFavorite,
  onDelete,
  onArchive,
}: {
  doc: HealthDocument
  onToggleFavorite: (id: string, current: boolean) => void
  onDelete: (id: string, storagePath: string) => void
  onArchive: (id: string, current: boolean) => void
}) {
  const Icon = categoryIcons[doc.type] || FileText
  const colorClass = categoryColorMap[doc.type] || "bg-gray-500"
  const catInfo = DOCUMENT_CATEGORIES[doc.type]

  return (
    <Card className="doc-card border-border/60 group relative overflow-hidden">
      {/* Action buttons on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.preventDefault(); onToggleFavorite(doc.id, doc.isFavorite) }}
          className="p-1.5 bg-background/90 rounded-lg shadow-sm hover:bg-background transition-colors"
        >
          <Star className={cn("h-3.5 w-3.5", doc.isFavorite ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onArchive(doc.id, doc.isArchived) }}
          className="p-1.5 bg-background/90 rounded-lg shadow-sm hover:bg-background transition-colors"
        >
          <Archive className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(doc.id, doc.storagePath) }}
          className="p-1.5 bg-background/90 rounded-lg shadow-sm hover:bg-background transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>

      <Link href={`/documents/${doc.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${colorClass} flex-shrink-0`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{doc.title}</h3>
              <Badge variant="secondary" className="text-[11px] mt-1">
                {catInfo?.label || doc.type}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{format(new Date(doc.date || doc.uploadedAt), "MMM d, yyyy")}</span>
            </div>
            {doc.doctor && (
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{doc.doctor}</span>
              </div>
            )}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-2">
                {doc.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 2 && (
                  <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">
                    +{doc.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            <span>{formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

function DocumentListRow({
  doc,
  onToggleFavorite,
  onDelete,
  onArchive,
}: {
  doc: HealthDocument
  onToggleFavorite: (id: string, current: boolean) => void
  onDelete: (id: string, storagePath: string) => void
  onArchive: (id: string, current: boolean) => void
}) {
  const Icon = categoryIcons[doc.type] || FileText
  const colorClass = categoryColorMap[doc.type] || "bg-gray-500"
  const catInfo = DOCUMENT_CATEGORIES[doc.type]

  return (
    <Card className="doc-card border-border/60 group">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${colorClass} flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>

          <Link href={`/documents/${doc.id}`} className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                {doc.title}
              </h3>
              <Badge variant="secondary" className="text-[11px] w-fit">{catInfo?.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(doc.date || doc.uploadedAt), "MMM d, yyyy")}
              </span>
              {doc.doctor && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {doc.doctor}
                </span>
              )}
              <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </Link>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavorite(doc.id, doc.isFavorite)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Star className={cn("h-4 w-4", doc.isFavorite ? "text-amber-400 fill-amber-400" : "text-muted-foreground")} />
            </button>
            <Link href={`/documents/${doc.id}`}>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
            </Link>
            <button
              onClick={() => onArchive(doc.id, doc.isArchived)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Archive className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete(doc.id, doc.storagePath)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DocumentsContent() {
  const [documents, setDocuments] = useState<HealthDocument[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAddDocument, setShowAddDocument] = useState(false)
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setUserId(user.uid)
        await loadDocuments(user.uid)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loadDocuments = async (uid: string) => {
    try {
      const docs = await getUserDocuments(uid)
      setDocuments(docs)
    } catch (err) {
      console.error("Error loading documents:", err)
    }
  }

  const filtered = documents
    .filter((d) => {
      const matchSearch =
        !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.tags && d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        DOCUMENT_CATEGORIES[d.type]?.label.toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory = selectedCategory === "all" || d.type === selectedCategory

      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case "name":
          return a.title.localeCompare(b.title)
        case "size":
          return b.fileSize - a.fileSize
        default:
          return 0
      }
    })

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      await toggleFavorite(id, current)
      if (userId) loadDocuments(userId)
      toast.success(current ? "Removed from favorites" : "Added to favorites ⭐")
    } catch (err) {
      toast.error("Failed to update favorite status")
    }
  }

  const handleDelete = async (id: string, storagePath: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document permanently?")
    if (!confirmed) return

    try {
      await deleteDocument(id, storagePath)
      if (userId) loadDocuments(userId)
      toast.success("Document deleted permanently")
    } catch (err) {
      toast.error("Failed to delete document")
    }
  }

  const handleArchive = async (id: string, current: boolean) => {
    try {
      await toggleArchive(id, current)
      if (userId) loadDocuments(userId)
      toast.success(current ? "Unarchived document" : "Document archived")
    } catch (err) {
      toast.error("Failed to archive document")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("newest")
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || sortBy !== "newest"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} of {documents.length} documents
          </p>
        </div>
        <Button
          className="gradient-health text-white font-semibold gap-2 w-full sm:w-auto"
          onClick={() => setShowAddDocument(true)}
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, doctors, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="size">Largest first</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {DOCUMENT_CATEGORIES[selectedCategory as DocumentCategory]?.label}
              <button onClick={() => setSelectedCategory("all")}><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-primary hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Documents */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {filtered.map((doc) => (
              <DocumentGridCard
                key={doc.id}
                doc={doc}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filtered.map((doc) => (
              <DocumentListRow
                key={doc.id}
                doc={doc}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 bg-muted rounded-2xl mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {documents.length === 0 ? "No documents yet" : "No documents found"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {documents.length === 0
              ? "Upload your health records, prescriptions, and lab reports to get started."
              : "Try adjusting your search or filters."}
          </p>
          {documents.length === 0 && (
            <Button
              className="gradient-health text-white gap-2"
              onClick={() => setShowAddDocument(true)}
            >
              <Plus className="h-4 w-4" />
              Upload First Document
            </Button>
          )}
          {documents.length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      <AddDocumentModal
        open={showAddDocument}
        onOpenChange={setShowAddDocument}
        onDocumentAdded={() => userId && loadDocuments(userId)}
      />
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <AppShell>
      <DocumentsContent />
    </AppShell>
  )
}

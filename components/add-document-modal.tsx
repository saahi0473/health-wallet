"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Plus, FileText, AlertCircle } from "lucide-react"
import {
  uploadFile, saveDocument, DOCUMENT_CATEGORIES, type DocumentCategory,
} from "@/lib/firebase-db"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onDocumentAdded?: () => void
}

export function AddDocumentModal({ open, onOpenChange, onDocumentAdded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileError, setFileError] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [docType, setDocType] = useState<DocumentCategory | "">("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (f: File) => {
    if (!ACCEPTED_TYPES.includes(f.type)) return "Only PDF, JPG, PNG, WebP files supported"
    if (f.size > MAX_FILE_SIZE) return `File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Max 10MB.`
    return null
  }

  const handleFileSelect = (f: File) => {
    setFileError("")
    const err = validateFile(f)
    if (err) { setFileError(err); return }
    setFile(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [])

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag("") }
  }

  const validate = (title: string) => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = "Title is required"
    if (!docType) e.type = "Document type is required"
    if (!file) e.file = "Please select a file"
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const title = data.get("title") as string
    if (!validate(title)) return

    const user = auth.currentUser
    if (!user || !file) return

    setIsUploading(true)
    setProgress(0)

    try {
      // Step 1 — Upload real file to Firebase Storage
      const { url, path } = await uploadFile(file, user.uid, (pct) => setProgress(pct))

      // Step 2 — Save metadata to Firestore
      await saveDocument({
        title: title.trim(),
        type: docType as DocumentCategory,
        date: (data.get("date") as string) || new Date().toISOString().split("T")[0],
        doctor: (data.get("doctor") as string) || undefined,
        hospital: (data.get("hospital") as string) || undefined,
        tags,
        description: (data.get("description") as string) || undefined,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: url,          // ← Real Firebase Storage URL
        storagePath: path,     // ← For deletion later
        userId: user.uid,
        isFavorite: false,
        isArchived: false,
      })

      toast.success(`"${title}" uploaded to Firebase Storage! ✅`)
      reset()
      onOpenChange(false)
      onDocumentAdded?.()
    } catch (err) {
      toast.error("Upload failed. Check your connection and try again.")
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const reset = () => {
    setFile(null); setTags([]); setNewTag("")
    setDocType(""); setFormErrors({}); setFileError("")
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isUploading) { reset(); onOpenChange(v) } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Document</DialogTitle>
          <DialogDescription>File is uploaded to Firebase Cloud Storage — accessible anywhere.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Drop zone */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Document File *</Label>
            {!file ? (
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
                  fileError && "border-destructive"
                )}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <Upload className={cn("h-8 w-8 mx-auto mb-3", isDragOver ? "text-primary" : "text-muted-foreground")} />
                <p className="font-medium text-foreground mb-1">
                  {isDragOver ? "Drop your file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">PDF, JPG, PNG, WebP · max 10MB</p>
                <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {fileError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{fileError}</p>}
            {formErrors.file && <p className="text-xs text-destructive">{formErrors.file}</p>}
          </div>

          {/* Real upload progress */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading to Firebase...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input id="title" name="title" placeholder="e.g., Blood Test Results – Jan 2025"
                className={formErrors.title ? "border-destructive" : ""} />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={docType} onValueChange={(v) => { setDocType(v as DocumentCategory); setFormErrors(e => ({ ...e, type: "" })) }}>
                <SelectTrigger className={formErrors.type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.type && <p className="text-xs text-destructive">{formErrors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Document Date</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor / Provider</Label>
              <Input id="doctor" name="doctor" placeholder="Dr. Sarah Johnson" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital / Clinic</Label>
              <Input id="hospital" name="hospital" placeholder="City General Hospital" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}<button type="button" onClick={() => setTags(tags.filter(x => x !== t))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input placeholder="Add tag (press Enter)" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea id="description" name="description" placeholder="Any notes about this document..." rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }} disabled={isUploading}>Cancel</Button>
            <Button type="submit" className="gradient-health text-white gap-2" disabled={isUploading}>
              {isUploading
                ? <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading...</>
                : <><Upload className="h-4 w-4" />Upload to Firebase</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

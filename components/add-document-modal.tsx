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
import { Upload, X, Plus, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { documentStorage, DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/document-management"
import { sessionStorage as appSession } from "@/lib/user-management"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentAdded?: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"]

export function AddDocumentModal({ open, onOpenChange, onDocumentAdded }: AddDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileError, setFileError] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [documentType, setDocumentType] = useState<DocumentCategory | "">("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, PNG, and WebP files are supported"
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be under 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    setFileError("")
    const error = validateFile(file)
    if (error) {
      setFileError(error)
      return
    }
    setSelectedFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const validate = (title: string) => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Title is required"
    if (!documentType) errs.type = "Document type is required"
    if (!selectedFile) errs.file = "Please select a file to upload"
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const title = data.get("title") as string

    if (!validate(title)) return

    const session = appSession.getSession()
    if (!session || !selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval)
          return p
        }
        return p + 10
      })
    }, 100)

    await new Promise((r) => setTimeout(r, 1200))
    clearInterval(progressInterval)
    setUploadProgress(100)

    documentStorage.saveDocument(
      {
        title: title.trim(),
        type: documentType as DocumentCategory,
        date: (data.get("date") as string) || new Date().toISOString().split("T")[0],
        doctor: (data.get("doctor") as string) || undefined,
        hospital: (data.get("hospital") as string) || undefined,
        tags,
        description: (data.get("description") as string) || undefined,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        userEmail: session.email,
      },
      session.email
    )

    setIsUploading(false)
    setUploadProgress(0)
    resetForm()
    onOpenChange(false)
    toast.success(`"${title}" uploaded successfully!`)
    onDocumentAdded?.()
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTags([])
    setNewTag("")
    setDocumentType("")
    setFormErrors({})
    setFileError("")
  }

  const handleClose = () => {
    if (!isUploading) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Document</DialogTitle>
          <DialogDescription>
            Securely add a new health document to your wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* File upload zone */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Document File *</Label>

            {!selectedFile ? (
              <div
                className={cn(
                  "upload-zone border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  isDragOver
                    ? "border-primary bg-primary/5 drag-over"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                  fileError && "border-destructive"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className={cn(
                  "mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
                  isDragOver ? "bg-primary/10" : "bg-muted"
                )}>
                  <Upload className={cn("h-6 w-6", isDragOver ? "text-primary" : "text-muted-foreground")} />
                </div>
                <p className="font-medium text-foreground mb-1">
                  {isDragOver ? "Drop your file here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, JPG, PNG, WebP — max 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {fileError}
              </p>
            )}
            {formErrors.file && (
              <p className="text-xs text-destructive">{formErrors.file}</p>
            )}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Document details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Blood Test Results – Jan 2025"
                className={formErrors.title ? "border-destructive" : ""}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select
                value={documentType}
                onValueChange={(v) => {
                  setDocumentType(v as DocumentCategory)
                  setFormErrors((e) => ({ ...e, type: "" }))
                }}
              >
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
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
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
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., routine, blood-test)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Any additional notes about this document..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-health text-white gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type DocumentCategory =
  | "prescription"
  | "lab-report"
  | "medical-record"
  | "imaging"
  | "vaccination"
  | "insurance"
  | "bills"
  | "other"

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; color: string; bgColor: string }> = {
  prescription: { label: "Prescription", color: "text-blue-600", bgColor: "bg-blue-100" },
  "lab-report": { label: "Lab Report", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  "medical-record": { label: "Medical Record", color: "text-purple-600", bgColor: "bg-purple-100" },
  imaging: { label: "Imaging", color: "text-rose-600", bgColor: "bg-rose-100" },
  vaccination: { label: "Vaccination", color: "text-orange-600", bgColor: "bg-orange-100" },
  insurance: { label: "Insurance", color: "text-cyan-600", bgColor: "bg-cyan-100" },
  bills: { label: "Bills", color: "text-amber-600", bgColor: "bg-amber-100" },
  other: { label: "Other", color: "text-gray-600", bgColor: "bg-gray-100" },
}

export interface Document {
  id: string
  title: string
  type: DocumentCategory
  date: string
  doctor?: string
  hospital?: string
  tags: string[]
  description?: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  userEmail: string
  isFavorite?: boolean
  isArchived?: boolean
  sharedWith?: string[]
  fileDataUrl?: string // Base64 for preview (small files)
}

export const documentStorage = {
  saveDocument: (
    documentData: Omit<Document, "id" | "uploadedAt">,
    userEmail: string
  ): Document => {
    const documents = documentStorage.getAllDocuments()
    const newDocument: Document = {
      ...documentData,
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      uploadedAt: new Date().toISOString(),
      userEmail,
      isFavorite: false,
      isArchived: false,
    }
    documents.push(newDocument)
    if (typeof window !== "undefined") {
      localStorage.setItem("healthwallet_documents", JSON.stringify(documents))
    }
    return newDocument
  },

  getAllDocuments: (): Document[] => {
    if (typeof window === "undefined") return []
    const docs = localStorage.getItem("healthwallet_documents")
    return docs ? JSON.parse(docs) : []
  },

  getUserDocuments: (userEmail: string, includeArchived = false): Document[] => {
    const all = documentStorage.getAllDocuments()
    return all
      .filter((d) => d.userEmail === userEmail && (includeArchived || !d.isArchived))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  },

  getDocumentById: (id: string): Document | null => {
    const docs = documentStorage.getAllDocuments()
    return docs.find((d) => d.id === id) || null
  },

  getRecentDocuments: (userEmail: string, limit = 4): Document[] => {
    return documentStorage.getUserDocuments(userEmail).slice(0, limit)
  },

  getFavorites: (userEmail: string): Document[] => {
    return documentStorage.getUserDocuments(userEmail).filter((d) => d.isFavorite)
  },

  updateDocument: (id: string, updates: Partial<Document>): Document | null => {
    if (typeof window === "undefined") return null
    const docs = documentStorage.getAllDocuments()
    const idx = docs.findIndex((d) => d.id === id)
    if (idx === -1) return null
    docs[idx] = { ...docs[idx], ...updates }
    localStorage.setItem("healthwallet_documents", JSON.stringify(docs))
    return docs[idx]
  },

  deleteDocument: (id: string): void => {
    if (typeof window === "undefined") return
    const docs = documentStorage.getAllDocuments().filter((d) => d.id !== id)
    localStorage.setItem("healthwallet_documents", JSON.stringify(docs))
  },

  toggleFavorite: (id: string): Document | null => {
    const doc = documentStorage.getDocumentById(id)
    if (!doc) return null
    return documentStorage.updateDocument(id, { isFavorite: !doc.isFavorite })
  },

  toggleArchive: (id: string): Document | null => {
    const doc = documentStorage.getDocumentById(id)
    if (!doc) return null
    return documentStorage.updateDocument(id, { isArchived: !doc.isArchived })
  },

  getCategoryStats: (userEmail: string): Record<DocumentCategory, number> => {
    const docs = documentStorage.getUserDocuments(userEmail)
    const stats: Record<string, number> = {}
    docs.forEach((d) => {
      stats[d.type] = (stats[d.type] || 0) + 1
    })
    return stats as Record<DocumentCategory, number>
  },

  searchDocuments: (userEmail: string, query: string): Document[] => {
    const docs = documentStorage.getUserDocuments(userEmail)
    const q = query.toLowerCase()
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.doctor?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.description?.toLowerCase().includes(q) ||
        DOCUMENT_CATEGORIES[d.type]?.label.toLowerCase().includes(q)
    )
  },
}

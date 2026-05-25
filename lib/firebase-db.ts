import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "./firebase"

// ─── Document Types ───────────────────────────────────────────────────────────

export type DocumentCategory =
  | "prescription"
  | "lab-report"
  | "medical-record"
  | "imaging"
  | "vaccination"
  | "insurance"
  | "bills"
  | "other"

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; color: string }> = {
  prescription: { label: "Prescription", color: "bg-blue-500" },
  "lab-report": { label: "Lab Report", color: "bg-emerald-500" },
  "medical-record": { label: "Medical Record", color: "bg-purple-500" },
  imaging: { label: "Imaging / X-Ray", color: "bg-rose-500" },
  vaccination: { label: "Vaccination", color: "bg-orange-500" },
  insurance: { label: "Insurance", color: "bg-cyan-500" },
  bills: { label: "Medical Bills", color: "bg-amber-500" },
  other: { label: "Other", color: "bg-gray-500" },
}

export interface HealthDocument {
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
  fileUrl: string        // Real Firebase Storage download URL
  storagePath: string    // Path in bucket for deletion
  uploadedAt: string
  userId: string
  isFavorite: boolean
  isArchived: boolean
}

// ─── File Upload to Firebase Storage ─────────────────────────────────────────

export async function uploadFile(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<{ url: string; path: string }> {
  const path = `documents/${userId}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(pct)
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ url, path })
      }
    )
  })
}

// ─── Document CRUD ────────────────────────────────────────────────────────────

export async function saveDocument(
  data: Omit<HealthDocument, "id" | "uploadedAt">
): Promise<HealthDocument> {
  const docRef = await addDoc(collection(db, "documents"), {
    ...data,
    uploadedAt: new Date().toISOString(),
  })
  return { ...data, id: docRef.id, uploadedAt: new Date().toISOString() }
}

export async function getUserDocuments(userId: string): Promise<HealthDocument[]> {
  const q = query(
    collection(db, "documents"),
    where("userId", "==", userId),
    where("isArchived", "==", false),
    orderBy("uploadedAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HealthDocument))
}

export async function getDocumentById(id: string): Promise<HealthDocument | null> {
  const snap = await getDoc(doc(db, "documents", id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as HealthDocument) : null
}

export async function updateDocument(id: string, updates: Partial<HealthDocument>) {
  await updateDoc(doc(db, "documents", id), updates)
}

export async function toggleFavorite(id: string, current: boolean) {
  await updateDoc(doc(db, "documents", id), { isFavorite: !current })
}

export async function toggleArchive(id: string, current: boolean) {
  await updateDoc(doc(db, "documents", id), { isArchived: !current })
}

export async function deleteDocument(id: string, storagePath: string) {
  await deleteDoc(doc(db, "documents", id))
  try {
    await deleteObject(ref(storage, storagePath))
  } catch (_) {
    // File may already be gone — ignore
  }
}

export async function getCategoryStats(userId: string): Promise<Record<string, number>> {
  const docs = await getUserDocuments(userId)
  return docs.reduce((acc: Record<string, number>, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1
    return acc
  }, {})
}

// ─── Appointment CRUD ─────────────────────────────────────────────────────────

export interface Appointment {
  id: string
  title: string
  doctor: string
  specialty?: string
  hospital?: string
  date: string
  time: string
  notes?: string
  status: "upcoming" | "completed" | "cancelled"
  userId: string
  createdAt: string
}

export async function saveAppointment(
  data: Omit<Appointment, "id" | "createdAt">
): Promise<Appointment> {
  const ref2 = await addDoc(collection(db, "appointments"), {
    ...data,
    createdAt: new Date().toISOString(),
  })
  return { ...data, id: ref2.id, createdAt: new Date().toISOString() }
}

export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  const q = query(
    collection(db, "appointments"),
    where("userId", "==", userId),
    orderBy("date", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment))
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
  await updateDoc(doc(db, "appointments", id), updates)
}

export async function deleteAppointment(id: string) {
  await deleteDoc(doc(db, "appointments", id))
}

// ─── Emergency Profile ────────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
}

export interface EmergencyProfile {
  userId: string
  bloodGroup?: string
  allergies?: string[]
  conditions?: string[]
  medications?: string[]
  insuranceProvider?: string
  insurancePolicyNumber?: string
  contacts?: EmergencyContact[]
  updatedAt?: string
}

export async function getEmergencyProfile(userId: string): Promise<EmergencyProfile | null> {
  const snap = await getDoc(doc(db, "emergency", userId))
  return snap.exists() ? (snap.data() as EmergencyProfile) : null
}

export async function saveEmergencyProfile(userId: string, data: Partial<EmergencyProfile>) {
  await setDoc(
    doc(db, "emergency", userId),
    { ...data, userId, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}

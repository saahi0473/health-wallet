import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  createdAt: string
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

/** Register a new user with email + password */
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<UserProfile> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  // Set display name in Firebase Auth
  await updateProfile(user, { displayName: `${firstName} ${lastName}` })

  // Save extra profile info in Firestore
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    firstName,
    lastName,
    createdAt: new Date().toISOString(),
  }
  await setDoc(doc(db, "users", user.uid), profile)

  return profile
}

/** Sign in an existing user */
export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

/** Sign out the current user */
export async function logoutUser() {
  await signOut(auth)
}

/** Send a password reset email */
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

/** Get Firestore profile for a user */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

/** Update user profile in Firestore */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), { ...updates })
}

/** Listen to auth state changes (returns unsubscribe function) */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

/** Get the currently signed-in Firebase user */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

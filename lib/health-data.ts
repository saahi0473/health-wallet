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
  userEmail: string
  createdAt: string
}

export const appointmentStorage = {
  saveAppointment: (data: Omit<Appointment, "id" | "createdAt">, userEmail: string): Appointment => {
    const all = appointmentStorage.getAllAppointments()
    const apt: Appointment = {
      ...data,
      id: `apt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      userEmail,
    }
    all.push(apt)
    if (typeof window !== "undefined") {
      localStorage.setItem("healthwallet_appointments", JSON.stringify(all))
    }
    return apt
  },

  getAllAppointments: (): Appointment[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("healthwallet_appointments")
    return data ? JSON.parse(data) : []
  },

  getUserAppointments: (userEmail: string): Appointment[] => {
    return appointmentStorage
      .getAllAppointments()
      .filter((a) => a.userEmail === userEmail)
      .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
  },

  getUpcomingAppointments: (userEmail: string, limit = 3): Appointment[] => {
    const now = new Date()
    return appointmentStorage
      .getUserAppointments(userEmail)
      .filter((a) => new Date(a.date + " " + a.time) >= now && a.status === "upcoming")
      .slice(0, limit)
  },

  updateAppointment: (id: string, updates: Partial<Appointment>): Appointment | null => {
    if (typeof window === "undefined") return null
    const all = appointmentStorage.getAllAppointments()
    const idx = all.findIndex((a) => a.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates }
    localStorage.setItem("healthwallet_appointments", JSON.stringify(all))
    return all[idx]
  },

  deleteAppointment: (id: string): void => {
    if (typeof window === "undefined") return
    const all = appointmentStorage.getAllAppointments().filter((a) => a.id !== id)
    localStorage.setItem("healthwallet_appointments", JSON.stringify(all))
  },
}

export interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  isPrimary?: boolean
  userEmail: string
}

export interface EmergencyProfile {
  userEmail: string
  bloodGroup?: string
  allergies?: string[]
  conditions?: string[]
  medications?: string[]
  insuranceProvider?: string
  insurancePolicyNumber?: string
  contacts: EmergencyContact[]
  updatedAt: string
}

export const emergencyStorage = {
  getProfile: (userEmail: string): EmergencyProfile | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(`healthwallet_emergency_${userEmail}`)
    return data ? JSON.parse(data) : null
  },

  saveProfile: (userEmail: string, updates: Partial<EmergencyProfile>): EmergencyProfile => {
    const existing = emergencyStorage.getProfile(userEmail)
    const profile: EmergencyProfile = {
      userEmail,
      contacts: [],
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(`healthwallet_emergency_${userEmail}`, JSON.stringify(profile))
    }
    return profile
  },

  addContact: (userEmail: string, contact: Omit<EmergencyContact, "id" | "userEmail">): EmergencyContact => {
    const profile = emergencyStorage.getProfile(userEmail) || {
      userEmail,
      contacts: [],
      updatedAt: new Date().toISOString(),
    }
    const newContact: EmergencyContact = {
      ...contact,
      id: `ec_${Date.now()}`,
      userEmail,
    }
    profile.contacts = [...(profile.contacts || []), newContact]
    emergencyStorage.saveProfile(userEmail, profile)
    return newContact
  },

  removeContact: (userEmail: string, contactId: string): void => {
    const profile = emergencyStorage.getProfile(userEmail)
    if (!profile) return
    profile.contacts = profile.contacts.filter((c) => c.id !== contactId)
    emergencyStorage.saveProfile(userEmail, profile)
  },
}

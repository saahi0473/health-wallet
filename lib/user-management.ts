export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  password: string
  createdAt: string
  avatar?: string
  phone?: string
}

export interface UserSession {
  id: string
  email: string
  firstName: string
  lastName: string
  rememberMe: boolean
  avatar?: string
}

export interface UserProfile extends Omit<User, "password"> {
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
}

export const userStorage = {
  saveUser: (user: Omit<User, "id" | "createdAt">): User => {
    const users = userStorage.getAllUsers()
    const newUser: User = {
      ...user,
      email: user.email.toLowerCase().trim(),
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("healthwallet_users", JSON.stringify(users))
    }
    return newUser
  },

  getAllUsers: (): User[] => {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem("healthwallet_users")
    return users ? JSON.parse(users) : []
  },

  findUserByEmail: (email: string): User | null => {
    const users = userStorage.getAllUsers()
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
  },

  findUserById: (id: string): User | null => {
    const users = userStorage.getAllUsers()
    return users.find((u) => u.id === id) || null
  },

  validateCredentials: (email: string, password: string): User | null => {
    const user = userStorage.findUserByEmail(email)
    return user && user.password === password ? user : null
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    if (typeof window === "undefined") return null
    const users = userStorage.getAllUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    users[idx] = { ...users[idx], ...updates }
    localStorage.setItem("healthwallet_users", JSON.stringify(users))
    return users[idx]
  },
}

export const sessionStorage = {
  createSession: (user: User, rememberMe = false): void => {
    if (typeof window === "undefined") return
    const session: UserSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      rememberMe,
      avatar: user.avatar,
    }
    localStorage.setItem("healthwallet_session", JSON.stringify(session))
    localStorage.setItem("isAuthenticated", "true")

    if (rememberMe) {
      localStorage.setItem("healthwallet_remembered_email", user.email)
    } else {
      localStorage.removeItem("healthwallet_remembered_email")
    }
  },

  getSession: (): UserSession | null => {
    if (typeof window === "undefined") return null
    const s = localStorage.getItem("healthwallet_session")
    return s ? JSON.parse(s) : null
  },

  getRememberedEmail: (): string => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("healthwallet_remembered_email") || ""
  },

  updateSession: (updates: Partial<UserSession>): void => {
    if (typeof window === "undefined") return
    const session = sessionStorage.getSession()
    if (!session) return
    localStorage.setItem("healthwallet_session", JSON.stringify({ ...session, ...updates }))
  },

  clearSession: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem("healthwallet_session")
    localStorage.removeItem("isAuthenticated")
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isAuthenticated") === "true"
  },
}

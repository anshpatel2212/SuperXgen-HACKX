"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { DEMO_ACCOUNTS, DEMO_AUTH_VERSION } from "@/config/demo-auth"
import type { AuthUser } from "@/types"

export type { AuthUser } from "@/types"
export { getRoleHome } from "@/lib/auth-routing"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (data: { fullName: string; email: string; phone: string; password: string; role: "customer" | "owner" }) => Promise<AuthResult>
  logout: () => void
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}

interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser
}

interface StoredUser {
  user: AuthUser
  password: string
}

const USERS_KEY = "glowgo_users"
const SESSION_KEY = "glowgo_session"
const AUTH_VERSION_KEY = "glowgo_demo_auth_version"

function seedDemoUsers(stored: Record<string, StoredUser>) {
  const storedVersion = Number(localStorage.getItem(AUTH_VERSION_KEY) || 0)
  const shouldMigrate = storedVersion !== DEMO_AUTH_VERSION
  let changed = false

  for (const account of DEMO_ACCOUNTS) {
    const demoEmails = new Set([
      account.user.email.toLowerCase(),
      ...account.legacyEmails.map((email) => email.toLowerCase()),
    ])

    for (const [id, record] of Object.entries(stored)) {
      if (
        id !== account.user.id &&
        demoEmails.has(record.user.email.toLowerCase())
      ) {
        delete stored[id]
        changed = true
      }
    }

    if (shouldMigrate || !stored[account.user.id]) {
      stored[account.user.id] = {
        user: account.user,
        password: account.password,
      }
      changed = true
    }
  }

  if (shouldMigrate) {
    localStorage.setItem(AUTH_VERSION_KEY, String(DEMO_AUTH_VERSION))
  }

  return changed
}

function getStoredUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {}
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || "{}") as Record<string, StoredUser>
    if (seedDemoUsers(stored)) setStoredUsers(stored)
    return stored
  } catch {
    const seededUsers = Object.fromEntries(
      DEMO_ACCOUNTS.map((account) => [
        account.user.id,
        { user: account.user, password: account.password },
      ])
    )
    localStorage.setItem(AUTH_VERSION_KEY, String(DEMO_AUTH_VERSION))
    setStoredUsers(seededUsers)
    return seededUsers
  }
}

function setStoredUsers(users: Record<string, StoredUser>) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(SESSION_KEY)
    if (!data) return null
    const session = JSON.parse(data) as Partial<AuthUser>
    if (
      typeof session.id !== "string" ||
      typeof session.email !== "string" ||
      typeof session.full_name !== "string" ||
      !["customer", "owner", "admin"].includes(session.role || "")
    ) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session as AuthUser
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function setSession(user: AuthUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function generateId(): string {
  return "user_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const users = getStoredUsers()
      const session = getSession()
      const currentUser = session ? users[session.id]?.user || null : null
      setUser(currentUser)
      setSession(currentUser)
      setIsLoading(false)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const users = getStoredUsers()
    const normalizedEmail = email.trim().toLowerCase()
    const record = Object.values(users).find(
      (storedUser) => storedUser.user.email.toLowerCase() === normalizedEmail
    )

    if (!record) {
      return { success: false, error: "No account found with this email. Please sign up." }
    }

    if (record.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." }
    }

    setUser(record.user)
    setSession(record.user)
    return { success: true, user: record.user }
  }, [])

  const signup = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: "customer" | "owner" }) => {
    const users = getStoredUsers()
    const normalizedEmail = data.email.trim().toLowerCase()
    const exists = Object.values(users).some(
      (storedUser) => storedUser.user.email.toLowerCase() === normalizedEmail
    )

    if (exists) {
      return { success: false, error: "An account with this email already exists." }
    }

    const newUser: AuthUser = {
      id: generateId(),
      email: normalizedEmail,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      role: data.role,
      avatar_url: "",
    }

    users[newUser.id] = { user: newUser, password: data.password }
    setStoredUsers(users)

    setUser(newUser)
    setSession(newUser)
    return { success: true, user: newUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setSession(null)
    router.replace("/login")
  }, [router])

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!user) return { success: false, error: "Not logged in" }

    const users = getStoredUsers()
    if (!users[user.id]) return { success: false, error: "User not found" }

    users[user.id].user = { ...users[user.id].user, ...data }
    setStoredUsers(users)

    const updated = { ...user, ...data }
    setUser(updated)
    setSession(updated)
    return { success: true }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

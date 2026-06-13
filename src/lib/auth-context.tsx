"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  phone: string
  role: "customer" | "owner" | "admin"
  avatar_url: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (data: { fullName: string; email: string; phone: string; password: string; role: "customer" | "owner" }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
}

const USERS_KEY = "glowgo_users"
const SESSION_KEY = "glowgo_session"

function getStoredUsers(): Record<string, { user: AuthUser; password: string }> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}")
  } catch {
    return {}
  }
}

function setStoredUsers(users: Record<string, { user: AuthUser; password: string }>) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem(SESSION_KEY)
    return data ? JSON.parse(data) : null
  } catch {
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
    const sessionUser = getSession()
    if (sessionUser) setUser(sessionUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const users = getStoredUsers()
    const record = Object.values(users).find((u) => u.user.email === email)

    if (!record) {
      return { success: false, error: "No account found with this email. Please sign up." }
    }

    if (record.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." }
    }

    setUser(record.user)
    setSession(record.user)
    return { success: true }
  }, [])

  const signup = useCallback(async (data: { fullName: string; email: string; phone: string; password: string; role: "customer" | "owner" }) => {
    const users = getStoredUsers()
    const exists = Object.values(users).some((u) => u.user.email === data.email)

    if (exists) {
      return { success: false, error: "An account with this email already exists." }
    }

    const newUser: AuthUser = {
      id: generateId(),
      email: data.email,
      full_name: data.fullName,
      phone: data.phone,
      role: data.role,
      avatar_url: "",
    }

    users[newUser.id] = { user: newUser, password: data.password }
    setStoredUsers(users)

    setUser(newUser)
    setSession(newUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setSession(null)
    router.push("/")
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

"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getRoleHome, type AuthUser, useAuth } from "@/lib/auth-context"

interface RoleGuardProps {
  children: ReactNode
  requiredRole: AuthUser["role"]
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== requiredRole) {
      router.replace(getRoleHome(user.role))
    }
  }, [isLoading, requiredRole, router, user])

  if (isLoading || !user || user.role !== requiredRole) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-glowgo-cream/20">
        <div
          className="size-8 animate-spin rounded-full border-2 border-glowgo-pink/20 border-t-glowgo-pink"
          role="status"
          aria-label="Checking account access"
        />
      </div>
    )
  }

  return children
}

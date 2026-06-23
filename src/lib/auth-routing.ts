import type { UserRole } from "@/types"

const LOCAL_ORIGIN = "https://glowgo.demo"
const AUTH_PATHS = new Set(["/login", "/signup", "/forgot-password"])

export function getRoleHome(role: UserRole): string {
  if (role === "admin") return "/admin"
  if (role === "owner") return "/owner"
  return "/dashboard"
}

export function getSafeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null

  const candidate = value.trim()
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return null
  }

  try {
    const decoded = decodeURIComponent(candidate)
    if (decoded.startsWith("//") || decoded.includes("\\")) return null

    const parsed = new URL(candidate, LOCAL_ORIGIN)
    if (parsed.origin !== LOCAL_ORIGIN) return null
    if (AUTH_PATHS.has(parsed.pathname) || parsed.pathname.startsWith("/api/")) {
      return null
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return null
  }
}

export function getPostAuthDestination(
  role: UserRole,
  requestedPath?: string | null
): string {
  const safePath = getSafeReturnPath(requestedPath)
  if (!safePath) return getRoleHome(role)

  const pathname = new URL(safePath, LOCAL_ORIGIN).pathname
  if (role === "admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/")
      ? safePath
      : getRoleHome(role)
  }
  if (role === "owner") {
    return pathname === "/owner" || pathname.startsWith("/owner/")
      ? safePath
      : getRoleHome(role)
  }

  if (
    pathname === "/owner" ||
    pathname.startsWith("/owner/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return getRoleHome(role)
  }

  return safePath
}

export function getLoginHref(returnTo?: string | null): string {
  const safePath = getSafeReturnPath(returnTo)
  return safePath ? `/login?next=${encodeURIComponent(safePath)}` : "/login"
}

export function getSignupHref(returnTo?: string | null): string {
  const safePath = getSafeReturnPath(returnTo)
  return safePath ? `/signup?next=${encodeURIComponent(safePath)}` : "/signup"
}

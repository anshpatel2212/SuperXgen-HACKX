import type { AuthUser } from "@/lib/auth-context"

export interface DemoAccount {
  label: string
  user: AuthUser
  password: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Customer",
    user: {
      id: "u1",
      email: "riya.sharma@example.com",
      full_name: "Riya Sharma",
      phone: "+91 98765 43210",
      role: "customer",
      avatar_url: "",
    },
    password: "demo123",
  },
  {
    label: "Salon Owner",
    user: {
      id: "o1",
      email: "neha@glowandglam.com",
      full_name: "Neha Kapoor",
      phone: "+91 98200 12345",
      role: "owner",
      avatar_url: "",
    },
    password: "demo123",
  },
  {
    label: "Admin",
    user: {
      id: "admin1",
      email: "admin@glowgo.com",
      full_name: "GlowGo Admin",
      phone: "+91 90000 00000",
      role: "admin",
      avatar_url: "",
    },
    password: "demo123",
  },
]

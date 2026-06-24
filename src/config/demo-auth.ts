import type { AuthUser } from "@/types"

export interface DemoAccount {
  label: string
  user: AuthUser
  password: string
  legacyEmails: string[]
}

export const DEMO_AUTH_VERSION = 3

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Customer",
    user: {
      id: "u1",
      email: "customer@glowgo.demo",
      full_name: "Priya Sharma",
      phone: "+91 98765 43210",
      role: "customer",
      avatar_url: "",
    },
    password: "demo123",
    legacyEmails: ["riya.sharma@example.com"],
  },
  {
    label: "Salon Owner",
    user: {
      id: "o1",
      email: "owner@glowgo.demo",
      full_name: "Neha Kapoor",
      phone: "+91 98200 12345",
      role: "owner",
      avatar_url: "",
    },
    password: "demo123",
    legacyEmails: ["neha@glowandglam.com"],
  },
  {
    label: "Admin",
    user: {
      id: "admin1",
      email: "admin@glowgo.demo",
      full_name: "Admin User",
      phone: "+91 90000 00000",
      role: "admin",
      avatar_url: "",
    },
    password: "demo123",
    legacyEmails: ["admin@glowgo.com"],
  },
]

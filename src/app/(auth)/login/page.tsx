"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DEMO_ACCOUNTS } from "@/config/demo-auth"
import { useAuth } from "@/lib/auth-context"
import { GlowAppShell } from "@/components/glow-ui"
import {
  getPostAuthDestination,
  getSignupHref,
} from "@/lib/auth-routing"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const requestedPath = searchParams.get("next")
  const callbackError =
    searchParams.get("error") === "oauth_unavailable"
      ? "Social sign-in is not enabled in demo mode. Use one of the seeded demo accounts."
      : ""
  const visibleError = error || callbackError

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getPostAuthDestination(user.role, requestedPath))
    }
  }, [authLoading, requestedPath, router, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.")
      return
    }
    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)
    if (result.success && result.user) {
      router.replace(getPostAuthDestination(result.user.role, requestedPath))
    } else {
      setError(result.error || "Login failed. Please try again.")
    }
  }

  return (
    <GlowAppShell className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-[#201717] lg:flex lg:w-[52%]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,183,64,0.22),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(167,139,250,0.18),transparent_28%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff8dc] text-[#8f6b25] shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">GlowGo Afterglow OS</h1>
              <p className="text-sm text-[#cbbab4]">Mumbai</p>
            </div>
          </div>
          <h2 className="mb-4 text-5xl font-semibold leading-tight tracking-tight text-white">
            Demo the Beauty OS for
            <br />
            <span className="text-[#f4b740]">verified Mumbai salons</span>
          </h2>
          <p className="max-w-md text-lg leading-8 text-[#cbbab4]">
            Use seeded customer, owner, and admin personas to explore trust-first discovery, smart bookings, and salon operations.
          </p>
          <div className="mt-12 space-y-4">
            {["Trust Passport before booking", "Smart capacity-aware time blocks", "Owner and admin demo workflows"].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#f4b740]" />
                </div>
                <span className="text-sm text-[#fffaf5]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-[1.6rem] border border-[#ead8c5] bg-white/90 p-5 shadow-[0_28px_90px_rgba(45,29,24,0.12)] backdrop-blur-xl sm:p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#201717] text-[#f4b740]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-semibold text-[#201717]">Sign in to GlowGo</h2>
            <p className="mt-1 text-sm text-[#6f5d56]">Use demo accounts for judging.</p>
          </div>

          {visibleError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {visibleError}
            </div>
          )}

          <div className="mb-5 rounded-2xl border border-[#ead8c5] bg-[#fffdf9] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7d5b17]">Seeded demo accounts</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.user.role}
                  type="button"
                  onClick={() => {
                    setEmail(account.user.email)
                    setPassword(account.password)
                    setError("")
                  }}
                  className="min-h-11 rounded-full border border-[#ead8c5] bg-white px-3 py-2 text-xs font-semibold text-[#4b3a36] shadow-sm transition-colors hover:border-[#d7b982] hover:text-[#b71b62]"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#6f5d56]">Select a role, then sign in with the filled credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm text-glowgo-rose hover:text-glowgo-pink transition-colors">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-[linear-gradient(135deg,#db2777,#f43f5e_55%,#a78bfa)] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                Or continue with
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled
                className="h-10 text-xs"
                title="Google sign-in is planned for production. Use demo accounts for judging."
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google planned
              </Button>
              <Button
                variant="outline"
                disabled
                className="h-10 text-xs"
                title="Facebook sign-in is temporarily unavailable in the demo."
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook unavailable
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-500">
              Social OAuth is not configured in this demo. Use the seeded accounts above for judging.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href={getSignupHref(requestedPath)} className="text-glowgo-rose hover:text-glowgo-pink font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </GlowAppShell>
  )
}

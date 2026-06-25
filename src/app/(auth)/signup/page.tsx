"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles, Mail, Lock, Eye, EyeOff, Phone, User, UserPlus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import {
  getLoginHref,
  getPostAuthDestination,
} from "@/lib/auth-routing"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signup } = useAuth()
  const requestedPath = searchParams.get("next")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<"customer" | "owner">("customer")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.fullName.trim()) errs.fullName = "Full name is required"
    if (!formData.email.trim()) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email"
    if (!formData.phone.trim()) errs.phone = "Phone is required"
    if (!formData.password) errs.password = "Password is required"
    else if (formData.password.length < 6) errs.password = "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match"
    if (!agreeTerms) errs.terms = "You must agree to the terms"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validate()) return
    setIsLoading(true)
    const result = await signup({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
    })
    setIsLoading(false)
    if (result.success && result.user) {
      router.replace(
        role === "owner"
          ? "/owner/onboarding"
          : getPostAuthDestination(result.user.role, requestedPath)
      )
    } else {
      setError(result.error || "Sign up failed. Please try again.")
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-glowgo-lavender/20 via-glowgo-cream to-glowgo-pink/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-glowgo-lavender/30 via-transparent to-glowgo-pink/30" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-glowgo-pink to-glowgo-lavender shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">GlowGo</span>
              </h1>
              <p className="text-sm text-gray-500">Mumbai</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Join the
            <br />
            <span className="gradient-text">GlowGo</span> community
          </h2>
          <p className="text-lg text-gray-600 max-w-md">
            Discover Mumbai&apos;s best salons, book AI-matched services, and transform your beauty experience.
          </p>
          <div className="mt-12 space-y-4">
            {["Personalized salon recommendations", "Seamless booking experience", "Earn rewards with every visit"].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-glowgo-lavender/20">
                  <Sparkles className="w-4 h-4 text-glowgo-lavender" />
                </div>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join GlowGo and start your beauty journey.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    role === "customer"
                      ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-pink"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    role === "owner"
                      ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-pink"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Salon Owner
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className={`pl-9 ${errors.fullName ? "border-destructive" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`pl-9 ${errors.phone ? "border-destructive" : ""}`}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className={`pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
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
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={`pl-9 pr-9 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-1">
              <Label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={agreeTerms}
                  onCheckedChange={(v) => {
                    setAgreeTerms(v === true)
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }))
                  }}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-glowgo-rose hover:text-glowgo-pink">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-glowgo-rose hover:text-glowgo-pink">Privacy Policy</Link>
                </span>
              </Label>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm h-9"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
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
                className="h-8 text-xs"
                title="Google sign-up is planned for production. Use demo-local email sign-up or seeded accounts."
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
                className="h-8 text-xs"
                title="Facebook sign-up is temporarily unavailable in the demo."
              >
                <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook unavailable
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-500">
              Social OAuth is not configured in this demo.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href={getLoginHref(requestedPath)} className="text-glowgo-rose hover:text-glowgo-pink font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

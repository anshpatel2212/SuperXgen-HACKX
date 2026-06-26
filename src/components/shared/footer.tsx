"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, Globe, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles, Video } from "lucide-react"

const quickLinks = [
  { href: "/explore", label: "Explore Salons" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/dashboard/bookings", label: "My Bookings" },
  { href: "/owner", label: "Salon Autopilot" },
]

const categories = [
  { href: "/explore?category=bridal", label: "Bridal" },
  { href: "/explore?category=facial", label: "Facial" },
  { href: "/explore?category=haircut", label: "Haircut" },
  { href: "/explore?category=spa", label: "Spa" },
  { href: "/explore?category=massage", label: "Massage" },
  { href: "/explore?category=manicure", label: "Manicure" },
]

export function Footer() {
  const pathname = usePathname()
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  ) {
    return null
  }

  return (
    <footer className="border-t border-[#31231f] bg-[#201717] text-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff8dc] text-[#8f6b25]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold">GlowGo Afterglow OS</span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-[#cbbab4]">
              Beauty OS for verified Mumbai salons and smart bookings, with trust passports, capacity-aware slots,
              and salon operations in one demo platform.
            </p>
            <div className="flex gap-3 text-[#806b63]">
              <span className="cursor-not-allowed" aria-label="Instagram coming after the demo" title="Social channels coming after the demo">
                <Camera className="h-5 w-5" />
              </span>
              <span className="cursor-not-allowed" aria-label="Facebook coming after the demo" title="Social channels coming after the demo">
                <Globe className="h-5 w-5" />
              </span>
              <span className="cursor-not-allowed" aria-label="Community channel coming after the demo" title="Social channels coming after the demo">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="cursor-not-allowed" aria-label="YouTube coming after the demo" title="Social channels coming after the demo">
                <Video className="h-5 w-5" />
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#cbbab4] transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Categories</h3>
            <ul className="space-y-3">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#cbbab4] transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Mumbai Trust Desk</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#cbbab4]">
                <MapPin className="h-4 w-4 shrink-0 text-[#f4b740]" />
                Mumbai, Maharashtra, India
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-[#cbbab4] transition-colors hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-[#f4b740]" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:hello@glowgo.in" className="flex items-center gap-2 text-sm text-[#cbbab4] transition-colors hover:text-white">
                  <Mail className="h-4 w-4 shrink-0 text-[#f4b740]" />
                  hello@glowgo.in
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-[#cbbab4]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#f4b740]" />
                Demo trust status, not a production license.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#9f8981] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} GlowGo Mumbai. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/verification-policy" className="hover:text-white">Verification</Link>
            <Link href="/cancellation-policy" className="hover:text-white">Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

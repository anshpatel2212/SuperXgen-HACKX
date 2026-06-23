import Link from "next/link"
import { Sparkles, Globe, MessageCircle, Video, Camera, Mail, Phone, MapPin } from "lucide-react"

const QUICK_LINKS = [
  { href: "/explore", label: "Explore Salons" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/dashboard/bookings", label: "My Bookings" },
  { href: "/dashboard/preferences", label: "Beauty Profile" },
]

const CATEGORIES = [
  { href: "/explore?category=bridal", label: "Bridal" },
  { href: "/explore?category=facial", label: "Facial" },
  { href: "/explore?category=haircut", label: "Haircut" },
  { href: "/explore?category=spa", label: "Spa" },
  { href: "/explore?category=massage", label: "Massage" },
  { href: "/explore?category=manicure", label: "Manicure" },
]

export function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-rose-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-glowgo-pink to-glowgo-lavender">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="gradient-text">GlowGo</span>
                <span className="text-gray-700"> Mumbai</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered beauty salon marketplace connecting you with the best salons and services across Mumbai. Your
              perfect look, just a tap away.
            </p>
            <div className="flex gap-3">
              <span className="cursor-not-allowed text-gray-300" aria-label="Instagram coming after the demo" title="Social channels coming after the demo">
                <Camera className="w-5 h-5" />
              </span>
              <span className="cursor-not-allowed text-gray-300" aria-label="Facebook coming after the demo" title="Social channels coming after the demo">
                <Globe className="w-5 h-5" />
              </span>
              <span className="cursor-not-allowed text-gray-300" aria-label="Community channel coming after the demo" title="Social channels coming after the demo">
                <MessageCircle className="w-5 h-5" />
              </span>
              <span className="cursor-not-allowed text-gray-300" aria-label="YouTube coming after the demo" title="Social channels coming after the demo">
                <Video className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-3">
              {CATEGORIES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-glowgo-pink shrink-0" />
                Mumbai, Maharashtra, India
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <Phone className="w-4 h-4 text-glowgo-pink shrink-0" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:hello@glowgo.in" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  <Mail className="w-4 h-4 text-glowgo-pink shrink-0" />
                  hello@glowgo.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-rose-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} GlowGo Mumbai. All rights reserved. Made with love for Mumbai.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/terms" className="text-gray-400 hover:text-gray-700">Terms</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-gray-700">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

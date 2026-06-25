import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-glowgo-pink hover:underline">
        <ArrowLeft className="size-4" />
        Back to GlowGo
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-3 text-sm text-gray-500">Demo policy - updated June 25, 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-gray-600">
        <p>
          GlowGo Mumbai is currently a hackathon demonstration. Salon listings, availability, bookings, payments,
          analytics, and recommendations use sample data and must not be treated as confirmed commercial services.
        </p>
        <p>
          Booking requests created in the demo are non-binding and no payment is collected. Production launch requires
          verified salon agreements, secure authentication, durable storage, and transactional booking controls.
        </p>
        <p>
          Users must provide accurate information and use the platform lawfully. Unsupported, abusive, or fraudulent
          activity may be removed from a future production service.
        </p>
        <p>
          Salon listing approval requires business, identity, address, registration, and compliance review. This demo
          captures verification fields locally and does not upload or securely store real documents.
        </p>
      </div>
    </div>
  )
}

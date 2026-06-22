import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-glowgo-pink hover:underline">
        <ArrowLeft className="size-4" />
        Back to GlowGo
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Demo policy — updated June 22, 2026</p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-gray-600">
        <p>
          This hackathon demo stores account and preference information in the current browser and keeps some booking
          data in temporary server memory. It is not suitable for sensitive or production personal information.
        </p>
        <p>
          Do not enter real passwords, payment details, or confidential addresses. Demo data may be cleared when the
          browser storage or development server is reset.
        </p>
        <p>
          A production release will use secure authentication, a documented retention policy, encrypted transport,
          access controls, and user data-management workflows before accepting real customer information.
        </p>
      </div>
    </div>
  )
}

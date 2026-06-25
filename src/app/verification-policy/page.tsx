import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const REQUIRED_DOCUMENTS = [
  "Legal business name, trade/brand name, business type, and authorized representative declaration.",
  "Owner or representative identity proof such as PAN, Aadhaar, passport, or voter ID reference.",
  "Address proof such as electricity bill, rent agreement, property tax receipt, or shop agreement.",
  "Shops & Establishments registration or intimation details, with certificate placeholder.",
  "Municipal, trade, or health license details where applicable to the services offered.",
  "PAN and GSTIN where applicable based on tax rules and business turnover.",
  "Safety, hygiene, trained staff, sterilization, cosmetic product safety, and customer safety declarations.",
]

const REJECTION_REASONS = [
  "Invalid, expired, unreadable, or mismatched documents.",
  "Address or geocoding mismatch against the listed salon location.",
  "Unreachable phone or email during verification.",
  "Duplicate listing for the same business or location.",
  "Unsafe, prohibited, or unsupported services.",
  "Incomplete declarations or suspected document tampering.",
]

export default function VerificationPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-glowgo-pink hover:underline">
        <ArrowLeft className="size-4" />
        Back to GlowGo
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Salon Listing Verification Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Demo policy - updated June 25, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-7 text-gray-600">
        <section>
          <h2 className="text-base font-semibold text-gray-900">Required for Approval</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {REQUIRED_DOCUMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">Review Timeline</h2>
          <p className="mt-3">
            Verification usually takes 3-5 business days after all required documents are submitted.
            Complex, incomplete, or mismatched submissions may take 7-10 business days. Government
            license processing is handled outside GlowGo and may take longer.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">Status Flow</h2>
          <p className="mt-3">
            Listings can be Draft, Submitted, Under Review, Needs Changes, Verified, or Rejected.
            Admin approval is required before a production listing is treated as verified.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">Rejection and Resubmission</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {REJECTION_REASONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3">
            Rejected or needs-changes submissions can be corrected and resubmitted with updated
            details. Repeated mismatches may require manual admin review.
          </p>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <h2 className="font-semibold">Hackathon Demo Limitation</h2>
          <p className="mt-2">
            This hackathon demo stores verification data locally and captures document file names only.
            Production would use secure storage, server-side review, audit logs, access controls, and
            explicit retention rules before accepting real verification documents.
          </p>
        </section>
      </div>
    </div>
  )
}

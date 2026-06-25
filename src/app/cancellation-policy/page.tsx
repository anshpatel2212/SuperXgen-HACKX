import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CancellationPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-glowgo-pink hover:underline">
        <ArrowLeft className="size-4" />
        Back to GlowGo
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Booking & Cancellation Policy</h1>
      <p className="mt-3 text-sm text-gray-500">Demo policy - updated June 25, 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-7 text-gray-600">
        <p>
          GlowGo Mumbai currently sends booking requests to salons in the demo flow. Requests may be
          pending, confirmed, completed, cancelled, or rescheduled. Payment is not collected in this demo.
        </p>
        <p>
          The default salon policy shown in the product is free cancellation up to 24 hours before the
          appointment. Individual salons may define stricter production rules, but those rules must be
          visible before booking.
        </p>
        <p>
          Group booking requests require salon confirmation because party size, staff availability,
          service duration, and slot capacity can change the schedule. They should not be treated as
          instantly confirmed until the salon accepts the request.
        </p>
        <p>
          GlowGo uses service-aware scheduling in the demo: longer services can require continuous
          time blocks, including prep and cleanup buffers. If the selected service cannot fit into an
          available window, the booking UI may hide that start time or ask the customer to choose another day.
        </p>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-5">
          <h2 className="font-semibold text-gray-900">Late arrival policy</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>0-10 minutes late: grace period, appointment continues normally when possible.</li>
            <li>10-20 minutes late: service may be shortened if the salon schedule allows.</li>
            <li>20+ minutes late: salon may reschedule or mark the booking as no-show.</li>
            <li>Long services may require rescheduling if the delay affects later appointments.</li>
          </ul>
        </div>
        <p>
          Production cancellation and refund handling would require server-side booking transactions,
          audit logs, payment provider integration, customer notifications, and dispute workflows.
        </p>
      </div>
    </div>
  )
}

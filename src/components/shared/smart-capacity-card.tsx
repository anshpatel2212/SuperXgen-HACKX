import { BadgeCheck, CalendarClock, Clock3, Scissors, ShieldCheck, UsersRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const orbitSignals = [
  { label: "Verified owner", icon: BadgeCheck, className: "left-3 top-6 bg-emerald-50 text-emerald-700" },
  { label: "2 chairs available", icon: UsersRound, className: "right-2 top-16 bg-violet-50 text-violet-700" },
  { label: "Offer applied", icon: ShieldCheck, className: "bottom-16 left-0 bg-amber-50 text-amber-700" },
  { label: "Reviews synced", icon: CalendarClock, className: "bottom-6 right-5 bg-pink-50 text-pink-700" },
]

export function SmartBookingOrbit({ className }: { className?: string }) {
  return (
    <div className={cn("relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_24px_70px_rgba(17,24,39,0.12)] backdrop-blur-2xl", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(219,39,119,0.14),transparent_32%),radial-gradient(circle_at_70%_20%,rgba(167,139,250,0.18),transparent_36%)]" />
      <div className="relative mx-auto mt-9 flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-glowgo-border bg-white/60">
        <div className="absolute h-32 w-32 rounded-full border border-dashed border-pink-200" />
        <div className="z-10 rounded-3xl border border-glowgo-border bg-white p-5 text-center shadow-[0_18px_45px_rgba(219,39,119,0.12)]">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-glowgo-pink to-rose-500 text-white">
            <Scissors className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-bold text-gray-950">Bridal makeup</p>
          <p className="text-xs text-gray-500">4 hr smart block</p>
        </div>
        {orbitSignals.map((signal, index) => {
          const Icon = signal.icon
          return (
            <div
              key={signal.label}
              className={cn(
                "absolute flex items-center gap-1.5 rounded-full border border-white/80 px-3 py-2 text-[11px] font-semibold shadow-sm",
                signal.className,
                index % 2 === 0 ? "animate-[slideUp_4s_ease-in-out_infinite]" : "animate-[slideUp_5s_ease-in-out_infinite]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {signal.label}
            </div>
          )
        })}
      </div>

      <div className="relative mt-6 space-y-3">
        <div className="rounded-2xl border border-glowgo-border bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-glowgo-pink">Smart Slot Engine</p>
              <p className="mt-1 text-sm font-semibold text-gray-950">Conflict-aware scheduling</p>
            </div>
            <Badge className="border-0 bg-emerald-50 text-emerald-700">
              <Clock3 className="mr-1 h-3 w-3" />
              Live demo data
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-gray-600">
            <span className="rounded-xl bg-glowgo-soft px-2 py-2">Duration</span>
            <span className="rounded-xl bg-violet-50 px-2 py-2">Capacity</span>
            <span className="rounded-xl bg-amber-50 px-2 py-2">Policy</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Demo marketplace powered by verified seed salons and browser-local judging flows.
        </p>
      </div>
    </div>
  )
}

export function SmartCapacityCard({ className }: { className?: string }) {
  const rows = [
    { service: "Haircut", duration: "45m", buffer: "10m cleanup", tone: "bg-pink-500" },
    { service: "Facial", duration: "90m", buffer: "prep + room reset", tone: "bg-violet-500" },
    { service: "Bridal Makeup", duration: "4h", buffer: "artist + chair lock", tone: "bg-amber-500" },
  ]

  return (
    <div className={cn("premium-card p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge className="mb-3 border-0 bg-violet-50 text-violet-700">Smart Capacity Engine</Badge>
          <h2 className="text-2xl font-bold text-gray-950 sm:text-4xl">Not every service fits into a one-hour slot.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            GlowGo considers service duration, buffers, slot capacity, and continuous availability before showing bookable times.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.service} className="rounded-2xl border border-glowgo-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={cn("h-3 rounded-full", row.tone)} style={{ width: row.service === "Bridal Makeup" ? "72%" : row.service === "Facial" ? "45%" : "26%" }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-950">{row.service}</p>
                <p className="text-xs text-gray-500">{row.duration} · {row.buffer}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[11px]">
                Continuous
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {["Staff", "Chair", "Buffer", "Verification", "Owner approval"].map((chip) => (
          <span key={chip} className="shrink-0 rounded-full border border-glowgo-border bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

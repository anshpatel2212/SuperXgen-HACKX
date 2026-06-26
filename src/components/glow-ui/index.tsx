"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarCheck,
  CalendarDays,
  Clock,
  Compass,
  FileCheck2,
  GitCompareArrows,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Tag,
  UserRound,
  X,
} from "lucide-react"
import { useMemo, useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { OFFERS, SERVICES } from "@/data"
import { getLoginHref, getRoleHome } from "@/lib/auth-routing"
import { useAuth } from "@/lib/auth-context"
import { useDemoFavorites } from "@/lib/demo-favorites"
import { cleanGlowImageUrls, isAllowedGlowImageUrl } from "@/lib/glow-images"
import { isPublicService } from "@/lib/public-salons"
import { cn, formatPrice, getInitials } from "@/lib/utils"
import { computeResponseTimeBadge, computeSalonMetrics, computeTrustScoreBadge } from "@/services/calculations"
import type { Salon, Service } from "@/types"

const publicLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/owner", label: "For Owners" },
]

const customerItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/ai-assistant", label: "AI", icon: Bot },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
]

const ownerItems = [
  { href: "/owner", label: "Cockpit", icon: LayoutDashboard },
  { href: "/owner/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/owner/slots", label: "Slots", icon: Store },
  { href: "/owner/services", label: "Services", icon: Scissors },
  { href: "/owner/onboarding", label: "Setup", icon: MoreHorizontal },
]

const adminItems = [
  { href: "/admin", label: "Command", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: UserRound },
  { href: "/admin/salons", label: "Salons", icon: Store },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "More", icon: MoreHorizontal },
]

function getGlowButtonClasses(variant: "primary" | "secondary" | "ghost" | "danger" = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glowgo-pink/40 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-[linear-gradient(135deg,#db2777,#f43f5e_55%,#a78bfa)] text-white shadow-[0_16px_36px_rgba(219,39,119,0.24)] hover:-translate-y-0.5",
    variant === "secondary" && "border border-[#ead8c5] bg-white/85 text-[#221a18] shadow-sm hover:border-[#d7b982] hover:bg-white",
    variant === "ghost" && "text-[#4b3a36] hover:bg-white/70",
    variant === "danger" && "bg-red-600 text-white shadow-[0_12px_28px_rgba(220,38,38,0.18)] hover:bg-red-700",
    className
  )
}

function canUseNextImage(src: string) {
  if (src.startsWith("data:") || src.startsWith("blob:")) return false
  return isAllowedGlowImageUrl(src)
}

export function GlowAppShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-h-screen overflow-x-clip bg-[#fffaf5] text-[#201717]", className)}>
      {children}
    </div>
  )
}

export function GlowButton({
  href,
  variant = "primary",
  className,
  children,
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: React.ReactNode
}) {
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={getGlowButtonClasses(variant, className)}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={getGlowButtonClasses(variant, className)} {...props}>
      {content}
    </button>
  )
}

export function GlowCard({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode
  className?: string
  as?: "div" | "article" | "section"
}) {
  const Component = as
  return (
    <Component
      className={cn(
        "rounded-[1.35rem] border border-[#ead8c5]/80 bg-white/86 shadow-[0_22px_70px_rgba(45,29,24,0.07)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </Component>
  )
}

export function GlowSection({
  eyebrow,
  title,
  copy,
  actions,
  children,
  className,
}: {
  eyebrow?: string
  title?: string
  copy?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("py-12 sm:py-16 lg:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || copy || actions) && (
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <p className="mb-3 inline-flex rounded-full border border-[#ead8c5] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6b25]">
                  {eyebrow}
                </p>
              )}
              {title && <h2 className="text-2xl font-semibold tracking-tight text-[#201717] sm:text-4xl">{title}</h2>}
              {copy && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f5d56] sm:text-base">{copy}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function GlowHero({
  badge,
  title,
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  visual,
}: {
  badge: string
  title: string
  copy: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  visual: React.ReactNode
}) {
  return (
    <section className="relative w-full max-w-full overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(244,183,64,0.22),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(167,139,250,0.18),transparent_26%),linear-gradient(135deg,#fffaf5_0%,#fffdf9_48%,#fff1f5_100%)]">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9bd79]/60 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:py-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
        <div className="min-w-0 max-w-[22.25rem] sm:max-w-3xl">
          <p className="mb-4 inline-flex max-w-full whitespace-normal rounded-full border border-[#ead8c5] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#7b5a20] shadow-sm backdrop-blur">
            {badge}
          </p>
          <h1 className="max-w-full whitespace-normal text-[clamp(2.35rem,10vw,3rem)] font-semibold leading-[1.06] tracking-tight text-[#201717] [overflow-wrap:anywhere] sm:text-6xl sm:leading-[1.02] lg:text-7xl">
            {title}
          </h1>
          <p className="mt-5 max-w-full text-base leading-7 text-[#6f5d56] [overflow-wrap:anywhere] sm:max-w-2xl sm:text-lg">{copy}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <GlowButton href={primaryHref} className="w-full sm:w-auto" icon={<ArrowRight className="h-4 w-4" />}>
              {primaryLabel}
            </GlowButton>
            <GlowButton href={secondaryHref} variant="secondary" className="w-full sm:w-auto">
              {secondaryLabel}
            </GlowButton>
          </div>
        </div>
        <div className="min-w-0 max-w-[22.25rem] overflow-hidden sm:max-w-full">{visual}</div>
      </div>
    </section>
  )
}

export function GlowImageFallback({
  src,
  alt,
  name,
  className,
  sizes = "100vw",
  priority = false,
}: {
  src?: string | null
  alt: string
  name?: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const normalizedSrc = src?.trim() || ""
  const showImage = Boolean(normalizedSrc && canUseNextImage(normalizedSrc) && !failed)
  const initials = getInitials(name || alt || "GlowGo")

  return (
    <div className={cn("relative overflow-hidden bg-[#fff2ea]", className)}>
      <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_22%_18%,rgba(244,183,64,0.18),transparent_30%),linear-gradient(135deg,#fffaf5,#f5e9ff_58%,#fff1f5)]">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/80 text-sm font-bold tracking-wide text-[#8f6b25] shadow-sm">
            {initials}
          </span>
          <span className="max-w-40 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c625a]">
            GlowGo verified
          </span>
        </div>
      </div>
      {showImage && (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

export function GlowTrustBadge({
  label,
  tone = "gold",
  icon,
  className,
}: {
  label: string
  tone?: "gold" | "lavender" | "green" | "rose" | "neutral"
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        tone === "gold" && "border-[#e3c87b]/70 bg-[#fff8dc] text-[#7d5b17]",
        tone === "lavender" && "border-[#d8ccff] bg-[#f5f1ff] text-[#6550a8]",
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        tone === "rose" && "border-rose-200 bg-rose-50 text-rose-700",
        tone === "neutral" && "border-[#ead8c5] bg-white/80 text-[#6f5d56]",
        className
      )}
    >
      {icon || <ShieldCheck className="h-3.5 w-3.5" />}
      {label}
    </span>
  )
}

export function GlowTrustPassport({
  salon,
  service,
  compact = false,
  className,
}: {
  salon?: Salon
  service?: Service | null
  compact?: boolean
  className?: string
}) {
  const verified = salon?.verified && (salon.status === "approved" || salon.status === "featured")
  const price = service ? service.final_price || service.discounted_price || service.price : 0
  const items = [
    { label: verified ? "Demo verified owner" : "Owner verification pending", icon: BadgeCheck, tone: verified ? "green" : "neutral" },
    { label: verified ? "Demo documents reviewed" : "Documents not public yet", icon: FileCheck2, tone: verified ? "gold" : "neutral" },
    { label: salon?.hygiene_practices?.length ? "Hygiene declaration present" : "Hygiene demo status", icon: ShieldCheck, tone: "lavender" },
    { label: "Reviews synced", icon: MessageSquare, tone: "gold" },
    { label: "Policy-backed booking", icon: CalendarCheck, tone: "green" },
    { label: salon?.cancellation_policy ? "Cancellation policy visible" : "Late policy protected", icon: Clock, tone: "neutral" },
    { label: service && price > 0 ? `${formatPrice(price)} price locked` : "Price transparency", icon: Tag, tone: "gold" },
    { label: salon?.status === "featured" ? "Admin featured" : "Admin-reviewed status", icon: ShieldCheck, tone: "lavender" },
  ] as const

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon
          return <GlowTrustBadge key={item.label} label={item.label} tone={item.tone} icon={<Icon className="h-3.5 w-3.5" />} />
        })}
      </div>
    )
  }

  return (
    <GlowCard className={cn("p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b25]">Trust Passport</p>
          <h3 className="mt-1 text-xl font-semibold text-[#201717]">Demo trust status before booking</h3>
        </div>
        <div className="rounded-full border border-[#e3c87b] bg-[#fff8dc] px-3 py-1 text-xs font-semibold text-[#7d5b17]">
          {verified ? "Demo verified" : "Draft / incomplete"}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] px-3 py-2 text-sm text-[#4b3a36]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6ecff] text-[#7461b6]">
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </div>
          )
        })}
      </div>
    </GlowCard>
  )
}

export function GlowSalonCard({
  salon,
  variant = "default",
  compareSelected = false,
  onCompare,
}: {
  salon: Salon
  variant?: "default" | "compact"
  compareSelected?: boolean
  onCompare?: (salon: Salon) => void
}) {
  const router = useRouter()
  const { user } = useAuth()
  const { favoriteIds, toggleFavorite } = useDemoFavorites(user?.id)
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )
  const isFavorited = mounted ? favoriteIds.includes(salon.id) : false
  const metrics = useMemo(() => computeSalonMetrics(salon.id, !mounted), [salon.id, mounted])
  const trustBadge = useMemo(() => computeTrustScoreBadge(metrics.trust_score), [metrics.trust_score])
  const responseBadge = useMemo(() => computeResponseTimeBadge(metrics.avg_response_time_minutes), [metrics.avg_response_time_minutes])
  const activeOfferCount = useMemo(() => OFFERS.filter((offer) => offer.salon_id === salon.id && offer.is_active).length, [salon.id])
  const topServices = useMemo(() => SERVICES.filter((service) => service.salon_id === salon.id && isPublicService(service)).slice(0, 3), [salon.id])
  const images = cleanGlowImageUrls([salon.cover_url, salon.cover_image, ...(salon.images || []), ...(salon.gallery || [])])
  const priceLabel =
    metrics.min_price > 0 && metrics.max_price > 0
      ? metrics.min_price === metrics.max_price
        ? formatPrice(metrics.min_price)
        : `${formatPrice(metrics.min_price)}-${formatPrice(metrics.max_price)}`
      : salon.price_range || "Price on request"

  const handleFavorite = () => {
    if (!user) {
      const returnTo = `${window.location.pathname}${window.location.search}`
      router.push(getLoginHref(returnTo))
      return
    }
    toggleFavorite(salon.id)
  }

  return (
    <GlowCard as="article" className={cn("group flex h-full flex-col overflow-hidden", variant === "compact" && "rounded-2xl")}>
      <div className="relative aspect-[4/3] min-h-52">
        <GlowImageFallback
          src={images[0]}
          alt={salon.name}
          name={salon.name}
          className="absolute inset-0"
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-black/8 to-transparent" />
        <button
          type="button"
          onClick={handleFavorite}
          className="absolute right-3 top-3 z-10 flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/88 text-[#4b3a36] shadow-sm backdrop-blur transition hover:bg-white"
          aria-label={isFavorited ? `Remove ${salon.name} from favorites` : `Save ${salon.name}`}
        >
          <Heart className={cn("h-4 w-4", isFavorited && "fill-rose-500 text-rose-500")} />
        </button>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge className="border-0 bg-white/90 text-[10px] font-semibold text-[#4b3a36] backdrop-blur">
            <ShieldCheck className="mr-1 h-3 w-3 text-emerald-600" />
            {trustBadge.label}
          </Badge>
          {salon.featured && (
            <Badge className="border-0 bg-[#fff8dc]/95 text-[10px] font-semibold text-[#7d5b17]">
              <Sparkles className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
          {activeOfferCount > 0 && (
            <Badge className="border-0 bg-rose-600/90 text-[10px] font-semibold text-white">
              <Tag className="mr-1 h-3 w-3" />
              Offer
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <GlowTrustBadge label="Demo trust status" tone="gold" className="bg-white/90 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/salon/${salon.id}`}>
              <h3 className="truncate text-base font-semibold text-[#201717] transition-colors group-hover:text-[#b71b62]">
                {salon.name}
              </h3>
            </Link>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#786760]">
              <MapPin className="h-3.5 w-3.5 text-[#b8862b]" />
              <span className="truncate">{salon.area}, {salon.city}</span>
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-[#fff8dc] px-2.5 py-1 text-xs font-semibold text-[#7d5b17]">
            {salon.rating_avg > 0 ? salon.rating_avg.toFixed(1) : "New"} <Star className="ml-0.5 inline h-3 w-3 fill-current" />
          </div>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#6f5d56]">
          {salon.tagline || salon.description || "Demo verified Mumbai salon ready for smart booking."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] p-3">
            <p className="text-[#927d74]">Starting at</p>
            <p className="mt-1 truncate font-semibold text-[#201717]">{priceLabel}</p>
          </div>
          <div className="rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] p-3">
            <p className="text-[#927d74]">Capacity signal</p>
            <p className="mt-1 truncate font-semibold text-[#201717]">{responseBadge.label}</p>
          </div>
        </div>

        {topServices.length > 0 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {topServices.map((service) => (
              <span key={service.id} className="shrink-0 rounded-full border border-[#ead8c5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6f5d56]">
                {service.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0e1ce] pt-4">
          <GlowButton href={`/salon/${salon.id}`} className="min-h-10 flex-1 px-4 text-xs">
            View Salon
          </GlowButton>
          {onCompare && (
            <button
              type="button"
              onClick={() => onCompare(salon)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors",
                compareSelected
                  ? "border-[#db2777] bg-[#fff1f5] text-[#b71b62]"
                  : "border-[#ead8c5] bg-white text-[#6f5d56] hover:border-[#d7b982]"
              )}
              aria-label={compareSelected ? `Remove ${salon.name} from compare` : `Compare ${salon.name}`}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{compareSelected ? "Added" : "Compare"}</span>
            </button>
          )}
        </div>
      </div>
    </GlowCard>
  )
}

export function GlowSmartCapacityPanel({ className }: { className?: string }) {
  const items = [
    { title: "Duration", copy: "Service time is reserved as a continuous block.", icon: Clock },
    { title: "Buffers", copy: "Prep and cleanup time protect staff handoffs.", icon: RotateCcw },
    { title: "Capacity", copy: "Slot capacity checks prevent overlapping appointments.", icon: CalendarCheck },
  ]

  return (
    <GlowCard className={cn("overflow-hidden p-5 sm:p-6", className)}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b25]">Smart Capacity</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#201717]">Conflict-aware scheduling for real salons</h3>
          <p className="mt-3 text-sm leading-6 text-[#6f5d56]">
            GlowGo treats every appointment as operational capacity, not just a calendar event. Services account for staff,
            resource type, duration, and buffer time before a customer confirms.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f1ff] text-[#7461b6]">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 font-semibold text-[#201717]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f5d56]">{item.copy}</p>
              </div>
            )
          })}
        </div>
      </div>
    </GlowCard>
  )
}

export function GlowBookingPanel({
  salon,
  service,
  date,
  time,
  total,
  children,
  className,
}: {
  salon: Salon
  service?: Service | null
  date?: string | null
  time?: string | null
  total?: number
  children?: React.ReactNode
  className?: string
}) {
  return (
    <GlowCard className={cn("p-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b25]">Smart Booking</p>
      <h3 className="mt-1 text-xl font-semibold text-[#201717]">{salon.name}</h3>
      <div className="mt-4 space-y-3 rounded-2xl border border-[#f0e1ce] bg-[#fffdf9] p-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[#927d74]">Service</span>
          <span className="text-right font-semibold text-[#201717]">{service?.name || "Choose service"}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#927d74]">Slot</span>
          <span className="text-right font-semibold text-[#201717]">{date && time ? `${date} · ${time}` : "Select time"}</span>
        </div>
        {typeof total === "number" && (
          <div className="flex justify-between gap-3 border-t border-[#f0e1ce] pt-3">
            <span className="text-[#927d74]">Total</span>
            <span className="text-right font-semibold text-[#201717]">{formatPrice(total)}</span>
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </GlowCard>
  )
}

export function GlowBookingBottomSheet({
  label,
  detail,
  actionLabel,
  onAction,
  disabled,
}: {
  label: string
  detail?: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ead8c5] bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-18px_50px_rgba(45,29,24,0.12)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-[22.25rem] items-center gap-3 sm:max-w-md">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#201717]">{label}</p>
          {detail && <p className="truncate text-xs text-[#6f5d56]">{detail}</p>}
        </div>
        <GlowButton onClick={onAction} disabled={disabled} className="min-h-11 shrink-0 px-3 sm:px-4">
          {actionLabel}
        </GlowButton>
      </div>
    </div>
  )
}

export function GlowCompareBar({
  salons,
  onClear,
  onCompare,
}: {
  salons: Salon[]
  onClear: () => void
  onCompare: () => void
}) {
  if (salons.length === 0) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#ead8c5] bg-white/96 px-4 py-3 shadow-[0_-18px_50px_rgba(45,29,24,0.12)] backdrop-blur-xl md:bottom-4 md:left-1/2 md:max-w-xl md:-translate-x-1/2 md:rounded-3xl md:border">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#201717]">{salons.length} selected for compare</p>
          <p className="truncate text-xs text-[#6f5d56]">{salons.map((salon) => salon.name).join(" vs ")}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <GlowButton variant="ghost" className="min-h-10 px-3 text-xs" onClick={onClear}>
            Clear
          </GlowButton>
          <GlowButton className="min-h-10 px-4 text-xs" disabled={salons.length < 2} onClick={onCompare}>
            Compare
          </GlowButton>
        </div>
      </div>
    </div>
  )
}

export function GlowMetricCard({
  label,
  value,
  icon,
  detail,
  tone = "gold",
}: {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
  detail?: string
  tone?: "gold" | "rose" | "lavender" | "green" | "charcoal"
}) {
  return (
    <GlowCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#927d74]">{label}</p>
          <div className="mt-2 text-2xl font-semibold text-[#201717]">{value}</div>
          {detail && <p className="mt-1 text-xs text-[#6f5d56]">{detail}</p>}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            tone === "gold" && "bg-[#fff8dc] text-[#8f6b25]",
            tone === "rose" && "bg-[#fff1f5] text-[#b71b62]",
            tone === "lavender" && "bg-[#f5f1ff] text-[#7461b6]",
            tone === "green" && "bg-emerald-50 text-emerald-700",
            tone === "charcoal" && "bg-[#201717] text-white"
          )}
        >
          {icon}
        </span>
      </div>
    </GlowCard>
  )
}

export function GlowEmptyState({
  icon,
  title,
  copy,
  action,
}: {
  icon?: React.ReactNode
  title: string
  copy?: string
  action?: React.ReactNode
}) {
  return (
    <GlowCard className="px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff8dc] text-[#8f6b25]">
        {icon || <Sparkles className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#201717]">{title}</h3>
      {copy && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f5d56]">{copy}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </GlowCard>
  )
}

export function GlowConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Keep booking",
  onConfirm,
  confirmDisabled,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  confirmDisabled?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.35rem] border-[#ead8c5] bg-[#fffdf9] p-5 shadow-[0_30px_90px_rgba(45,29,24,0.18)]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#201717]">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm leading-6 text-[#6f5d56]">{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-2">{children}</div>}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="min-h-11 rounded-full border-[#ead8c5]" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button className="min-h-11 rounded-full bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function GlowPublicHeader() {
  const { user, isLoading, logout } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()
  const dashboardHref = user ? getRoleHome(user.role) : "/dashboard"
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password"

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <nav className="mx-auto max-w-7xl rounded-full border border-[#ead8c5]/80 bg-white/86 px-3 shadow-[0_16px_50px_rgba(45,29,24,0.08)] backdrop-blur-xl">
        <div className="flex h-12 items-center justify-between gap-3 sm:h-13">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#201717] text-[#f4b740]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-[#201717] sm:text-base">
              GlowGo <span className="text-[#8f6b25]">Afterglow OS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "text-[#b71b62]"
                    : "text-[#6f5d56] hover:text-[#201717]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              <span className="h-8 w-8 rounded-full bg-[#f4eadc]" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-[#ead8c5] bg-white px-2 py-1.5 text-sm font-semibold text-[#201717]">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name} />
                    <AvatarFallback className="bg-[#201717] text-[10px] text-white">{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate">{user.full_name.split(" ")[0]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <span className="block truncate">{user.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { window.location.href = dashboardHref }}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : !isAuthPage ? (
              <>
                <GlowButton href="/login" variant="ghost" className="min-h-9 px-3">
                  Login
                </GlowButton>
                <GlowButton href="/signup" className="min-h-9 px-4" icon={<LogIn className="h-3.5 w-3.5" />}>
                  Sign Up
                </GlowButton>
              </>
            ) : null}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[#ead8c5] bg-white text-[#201717] md:hidden" aria-label="Open navigation menu">
              {sheetOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-[#ead8c5] bg-[#fffdf9]">
              <div className="mt-8 flex flex-col gap-5">
                {user && (
                  <div className="rounded-2xl border border-[#ead8c5] bg-white p-4">
                    <p className="text-sm font-semibold text-[#201717]">{user.full_name}</p>
                    <p className="text-xs text-[#6f5d56]">{user.email}</p>
                  </div>
                )}
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="text-base font-semibold text-[#201717]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-[#ead8c5] pt-5">
                  {user ? (
                    <div className="grid gap-3">
                      <GlowButton href={dashboardHref} variant="secondary" className="w-full">
                        Dashboard
                      </GlowButton>
                      <GlowButton
                        variant="ghost"
                        className="w-full text-red-600"
                        onClick={() => {
                          logout()
                          setSheetOpen(false)
                        }}
                      >
                        Logout
                      </GlowButton>
                    </div>
                  ) : !isAuthPage ? (
                    <div className="grid gap-3">
                      <GlowButton href="/login" variant="secondary" className="w-full">
                        Login
                      </GlowButton>
                      <GlowButton href="/signup" className="w-full">
                        Sign Up
                      </GlowButton>
                    </div>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export function GlowMobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/salon/") ||
    pathname.startsWith("/owner/onboarding")
  ) {
    return null
  }

  const items = user?.role === "owner" ? ownerItems : user?.role === "admin" ? adminItems : customerItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ead8c5] bg-white/96 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-1.5 shadow-[0_-14px_36px_rgba(45,29,24,0.10)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-semibold transition-colors",
                active ? "bg-[#fff8dc] text-[#7d5b17]" : "text-[#7b6a63]"
              )}
            >
              <Icon className="mb-0.5 h-4 w-4" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

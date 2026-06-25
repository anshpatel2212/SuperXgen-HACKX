import Link from "next/link"
import Image from "next/image"
import {
  Sparkles,
  Star,
  ChevronRight,
  ArrowRight,
  Bot,
  Shield,
  CalendarCheck,
  Home,
  Gem,
  IndianRupee,
  Zap,
  Scissors,
  Droplets,
  Flower2,
  Hand,
  Heart,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SalonCard } from "@/components/salon/salon-card"
import type { Salon } from "@/types"
import { SALONS, SERVICES, CATEGORIES, TESTIMONIALS } from "@/data"
import { cn } from "@/lib/utils"
import { HomeSearch } from "@/components/home/home-search"
import { getPublicSalons } from "@/lib/public-salons"
import { SmartBookingOrbit, SmartCapacityCard } from "@/components/shared/smart-capacity-card"
import { TrustPassportSection } from "@/components/shared/trust-passport"

const FEATURES = [
  {
    icon: Zap,
    title: "AI Recommendations",
    description: "Smart matches based on your beauty profile, preferences, and past bookings",
    gradient: "from-pink-100 to-rose-50",
    iconColor: "text-glowgo-pink",
  },
  {
    icon: Shield,
    title: "Verified Reviews",
    description: "Browse detailed demo reviews and ratings while comparing salons",
    gradient: "from-purple-100 to-violet-50",
    iconColor: "text-glowgo-lavender",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    description: "Send a booking request using managed salon availability and track its status",
    gradient: "from-emerald-100 to-teal-50",
    iconColor: "text-emerald-500",
  },
  {
    icon: Home,
    title: "Home Service",
    description: "Get salon-quality services at your doorstep with verified professionals",
    gradient: "from-amber-100 to-orange-50",
    iconColor: "text-amber-500",
  },
  {
    icon: Gem,
    title: "Luxury Salons",
    description: "Handpicked premium salons offering the finest beauty experiences",
    gradient: "from-rose-100 to-pink-50",
    iconColor: "text-rose-500",
  },
  {
    icon: IndianRupee,
    title: "Best Prices",
    description: "Exclusive deals and discounts you won't find anywhere else",
    gradient: "from-blue-100 to-cyan-50",
    iconColor: "text-blue-500",
  },
]

const CATEGORY_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-sky-400 to-blue-500",
]

const CATEGORY_ICONS = [Sparkles, Droplets, Scissors, Flower2, Zap, Hand, Heart, Sun]

const publicSalons = getPublicSalons(SALONS, SERVICES)
const featuredSalons = publicSalons.filter((s) => s.featured).slice(0, 6)
const catalogAreas = new Set(publicSalons.map((salon) => `${salon.city}:${salon.area}`)).size

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsSection />
      <TrustPassportSection />
      <FeaturedSalonsSection salons={featuredSalons} />
      <HowItWorksSection />
      <SmartCapacitySection />
      <CategoriesSection />
      <AIAssistantTeaser />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden mumbai-afterglow">
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
        <div className="max-w-3xl">
          <Badge className="mb-4 border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-glowgo-pink" />
            Verified salons · Smart booking · Mumbai
          </Badge>

          <h1 className="max-w-full break-words text-4xl font-bold leading-[1.04] text-gray-950 sm:text-5xl lg:text-7xl">
            Book verified Mumbai salons with smart, conflict-aware scheduling.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Discover trusted salons, compare services, book available time blocks, and let GlowGo protect customers and salon owners from impossible appointments.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/explore">
              <Button className="h-12 w-full rounded-2xl px-6 text-base premium-button sm:w-auto">
                Explore Salons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-12 w-full rounded-2xl border-glowgo-border bg-white/80 px-6 text-base text-gray-900 sm:w-auto">
                Try Demo Accounts
              </Button>
            </Link>
          </div>

          <div className="mt-6 max-w-2xl">
            <HomeSearch />
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              "Verified salon onboarding",
              "Owner dashboard",
              "Admin moderation",
              "Smart capacity engine",
            ].map((chip) => (
              <span key={chip} className="shrink-0 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 fill-glowgo-gold text-glowgo-gold" /> 4.8 avg rating
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1.5">{catalogAreas} demo areas</span>
            <span className="rounded-full bg-white/70 px-3 py-1.5">{publicSalons.length} verified demo salons</span>
          </div>
        </div>

        <SmartBookingOrbit className="mx-auto w-full max-w-md lg:max-w-none" />
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="relative -mt-8 z-10 sm:-mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
          {[
            { value: publicSalons.length.toString(), label: "Verified Demo Salons" },
            { value: SERVICES.length.toString(), label: "Bookable Services" },
            { value: catalogAreas.toString(), label: "Mumbai Areas" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-4 text-center sm:p-6"
            >
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedSalonsSection({ salons }: { salons: Salon[] }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Badge className="mb-3 px-3 py-1 bg-glowgo-pink/10 text-glowgo-pink border-0 rounded-full text-xs font-medium">
              Featured verified salons
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-950">Featured verified salons</h2>
            <p className="text-gray-600 mt-2">Equal-height premium cards with trust, pricing, reviews, and booking signals.</p>
          </div>
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-glowgo-pink hover:text-glowgo-pink/80 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-none">
          {salons.map((salon) => (
            <div key={salon.id} className="flex-none w-[280px] sm:w-[320px] snap-start">
              <SalonCard salon={salon} />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/explore">
            <Button variant="outline" className="rounded-full">
              View All Salons
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function SmartCapacitySection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SmartCapacityCard />
        <div className="mt-6 text-center">
          <Link href="/explore?sort=trust_score">
            <Button variant="outline" className="rounded-2xl border-glowgo-border bg-white">
              See available salons
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className="py-16 sm:py-24 bg-glowgo-cream/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-3 px-3 py-1 bg-glowgo-lavender/20 text-glowgo-lavender border-0 rounded-full text-xs font-medium">
            Categories
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Find exactly what you need</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const IconComponent = CATEGORY_ICONS[i] || Sparkles
            return (
              <Link key={cat.id} href={`/explore?category=${encodeURIComponent(cat.slug)}`} className="group">
                <Card className="border-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                        CATEGORY_GRADIENTS[i]
                      )}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-glowgo-pink transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{cat.service_count} services</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Discover verified salons",
      description: "Search by service, area, price, and trust signals across the Mumbai demo catalog.",
    },
    {
      number: "02",
      title: "Book smart time blocks",
      description: "GlowGo checks service duration, buffers, and capacity before showing bookable times.",
    },
    {
      number: "03",
      title: "Trust before confirm",
      description: "Review policy, verification, price, and service-fit details before submitting.",
    },
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-3 px-3 py-1 bg-glowgo-pink/10 text-glowgo-pink border-0 rounded-full text-xs font-medium">
            How It Works
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How GlowGo Works</h2>
          <p className="text-gray-500 mt-2">Discovery, capacity-aware booking, and trust review in one flow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-glowgo-pink/30 via-glowgo-lavender/30 to-glowgo-pink/30" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-glowgo-pink to-glowgo-lavender flex items-center justify-center mx-auto mb-6 shadow-lg shadow-glowgo-pink/20">
                <span className="text-xl font-bold text-white">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AIAssistantTeaser() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(248,180,200,0.15),transparent_50%),radial-gradient(circle_at_70%_20%,rgba(212,197,240,0.15),transparent_50%)]" />

          <div className="relative flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 px-3 py-1 bg-white/10 text-white border-0 rounded-full text-xs font-medium backdrop-blur-sm">
                <Bot className="w-3.5 h-3.5 mr-1.5 inline" />
                Glow AI
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Meet <span className="text-glowgo-pink">Glow AI</span>
              </h2>
              <p className="mt-4 text-gray-300 text-lg max-w-xl leading-relaxed">
                Your personal beauty assistant powered by AI. Describe what you need and we&apos;ll find the perfect
                match from Mumbai&apos;s demo salon catalog.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/ai-assistant">
                  <Button className="h-12 px-8 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 rounded-xl shadow-lg shadow-glowgo-pink/25 text-base">
                    Try Glow AI Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="outline"
                    className="h-12 px-8 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white rounded-xl text-base"
                  >
                    Browse Salons
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 flex flex-col justify-end">
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-glowgo-pink/20 rounded-2xl rounded-bl-sm p-3 mb-2">
                    <p className="text-white text-sm">
                      I want a bridal makeup artist in Bandra under ₹15,000
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-br-sm p-3 ml-8">
                    <p className="text-gray-200 text-xs">
                      I found 8 top-rated bridal makeup artists in Bandra. Here are the best matches...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-glowgo-pink to-glowgo-lavender flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-xs text-gray-400">Glow AI is typing...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-3 px-3 py-1 bg-glowgo-pink/10 text-glowgo-pink border-0 rounded-full text-xs font-medium">
            Why GlowGo
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything You Need</h2>
          <p className="text-gray-500 mt-2">The complete beauty booking experience</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title} className="border-0 transition-all duration-300 hover:shadow-md group">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                      feature.gradient
                    )}
                  >
                    <IconComponent className={cn("w-6 h-6", feature.iconColor)} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-3 px-3 py-1 bg-glowgo-lavender/20 text-glowgo-lavender border-0 rounded-full text-xs font-medium">
            Testimonials
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Our Users Say</h2>
          <p className="text-gray-500 mt-2">Real stories from real GlowGo users</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 bg-glowgo-cream/30 hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glowgo-gradient p-8 sm:p-12 lg:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,180,200,0.2),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Ready to Transform <span className="gradient-text">Your Look</span>?
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
              Browse the demo catalog and request your next salon appointment.
            </p>
            <Link href="/explore" className="mt-8 inline-flex">
              <Button className="h-12 px-8 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 rounded-xl shadow-lg whitespace-nowrap">
                Explore Salons
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

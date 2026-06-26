"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  GitCompareArrows,
  MapPinned,
  ShieldCheck,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { SalonCard } from "@/components/salon/salon-card"
import { GlowAppShell, GlowButton, GlowCard, GlowCompareBar, GlowEmptyState } from "@/components/glow-ui"
import { CATEGORIES, OFFERS, SALONS, SERVICES } from "@/data"
import { MUMBAI_AREAS, MUMBAI_CITIES, SERVICE_CATEGORIES, cn, formatPrice, parsePriceRange } from "@/lib/utils"
import { getPublicSalons, isPublicService } from "@/lib/public-salons"
import { computeSalonMetrics } from "@/services/calculations"
import type { Salon, SearchFilters } from "@/types"

const PUBLIC_SALONS = getPublicSalons(SALONS, SERVICES)

const defaultFilters: SearchFilters = {
  query: "",
  area: "",
  city: "Mumbai",
  service_type: "",
  min_price: 0,
  max_price: 100000,
  min_rating: 0,
  gender: "",
  luxury_level: "",
  offers_home_service: null,
  sort_by: "popularity",
}

function getInitialFilters(searchParams: URLSearchParams): SearchFilters {
  const minPrice = Number(searchParams.get("minPrice") || searchParams.get("min_price"))
  const maxPrice = Number(searchParams.get("maxPrice") || searchParams.get("max_price"))
  const minRating = Number(searchParams.get("rating") || searchParams.get("minRating"))
  const categoryParam = searchParams.get("category")?.trim().toLowerCase() || ""
  const category = CATEGORIES.find(
    (item) =>
      item.slug.toLowerCase() === categoryParam ||
      item.name.toLowerCase() === categoryParam
  )
  const categoryService = category?.name === "Bridal" ? "Bridal Makeup" : category?.name
  const service = (searchParams.get("service") || searchParams.get("service_type") || categoryService || "").trim()
  const cityParam = searchParams.get("city") || ""
  const areaParam = searchParams.get("area") || ""
  const genderParam = searchParams.get("gender")
  const luxuryParam = searchParams.get("luxury")
  const sortParam = searchParams.get("sort") || searchParams.get("sortBy")
  const validSorts: SearchFilters["sort_by"][] = [
    "popularity",
    "rating",
    "price_low",
    "price_high",
    "trust_score",
  ]

  return {
    ...defaultFilters,
    query: (searchParams.get("q") || searchParams.get("query") || "").trim().slice(0, 100),
    city: MUMBAI_CITIES.includes(cityParam) ? cityParam : defaultFilters.city,
    area: MUMBAI_AREAS.includes(areaParam) ? areaParam : "",
    service_type: service.slice(0, 100),
    min_price: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : 0,
    max_price: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : defaultFilters.max_price,
    min_rating: Number.isFinite(minRating) && minRating > 0 && minRating <= 5 ? minRating : 0,
    gender: genderParam === "women" || genderParam === "men" || genderParam === "unisex"
      ? genderParam
      : "",
    luxury_level:
      luxuryParam === "budget" ||
      luxuryParam === "mid" ||
      luxuryParam === "premium" ||
      luxuryParam === "luxury"
        ? luxuryParam
        : "",
    offers_home_service: searchParams.get("homeService") === "true" ? true : null,
    sort_by: validSorts.includes(sortParam as SearchFilters["sort_by"])
      ? sortParam as SearchFilters["sort_by"]
      : defaultFilters.sort_by,
  }
}

function matchesServiceType(service: (typeof SERVICES)[number], query: string) {
  if (!query) return true
  const normalized = query.toLowerCase()
  return (
    service.category.toLowerCase().includes(normalized) ||
    service.name.toLowerCase().includes(normalized) ||
    normalized.includes(service.category.toLowerCase())
  )
}

function getRelevantServices(salonId: string, filters: SearchFilters) {
  return SERVICES.filter(
    (service) =>
      service.active &&
      service.salon_id === salonId &&
      matchesServiceType(service, filters.service_type) &&
      (
        !filters.gender ||
        service.gender === filters.gender ||
        service.gender === "unisex"
      )
  )
}

function getSalonPriceRange(salonId: string, filters: SearchFilters) {
  const services = getRelevantServices(salonId, filters)
  const prices = services.map(
    (service) => service.final_price || service.discounted_price || service.price
  )
  if (prices.length === 0) return null
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-glowgo-cream/20" />}>
      <ExplorePageFromUrl />
    </Suspense>
  )
}

function ExplorePageFromUrl() {
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  return <ExploreResults key={searchKey} initialFilters={getInitialFilters(new URLSearchParams(searchKey))} />
}

function ExploreResults({ initialFilters }: { initialFilters: SearchFilters }) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [visibleCount, setVisibleCount] = useState(8)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const filteredSalons = useMemo(() => {
    let result = [...PUBLIC_SALONS]

    if (filters.query) {
      const q = filters.query.toLowerCase()
      const matchingSalonIds = new Set(
        SERVICES.filter(
          (service) =>
            service.active &&
            (service.name.toLowerCase().includes(q) ||
              service.category.toLowerCase().includes(q) ||
              service.description.toLowerCase().includes(q))
        ).map((service) => service.salon_id)
      )
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.area.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          matchingSalonIds.has(s.id)
      )
    }

    if (filters.city) {
      result = result.filter((s) => s.city.toLowerCase() === filters.city.toLowerCase())
    }

    if (filters.area) {
      result = result.filter((s) => s.area.toLowerCase() === filters.area.toLowerCase())
    }

    if (filters.service_type) {
      result = result.filter((salon) => getRelevantServices(salon.id, filters).length > 0)
    }

    if (filters.gender && !filters.service_type) {
      result = result.filter((salon) => getRelevantServices(salon.id, filters).length > 0)
    }

    if (filters.min_price > 0 || filters.max_price < 100000) {
      result = result.filter((salon) => {
        const serviceRange = getSalonPriceRange(salon.id, filters)
        const range = serviceRange || parsePriceRange(salon.price_range)
        return range.max >= filters.min_price && range.min <= filters.max_price
      })
    }

    if (filters.min_rating > 0) {
      result = result.filter((s) => s.rating_avg >= filters.min_rating)
    }

    if (filters.luxury_level) {
      result = result.filter((s) => s.luxury_level === filters.luxury_level)
    }

    if (filters.offers_home_service === true) {
      result = result.filter((s) => s.offers_home_service)
    }

    switch (filters.sort_by) {
      case "trust_score":
        result.sort((a, b) => computeSalonMetrics(b.id, true).trust_score - computeSalonMetrics(a.id, true).trust_score || a.name.localeCompare(b.name))
        break
      case "rating":
        result.sort((a, b) => b.rating_avg - a.rating_avg || a.name.localeCompare(b.name))
        break
      case "price_low":
        result.sort((a, b) => {
          const aMin = (getSalonPriceRange(a.id, filters) || parsePriceRange(a.price_range)).min
          const bMin = (getSalonPriceRange(b.id, filters) || parsePriceRange(b.price_range)).min
          return aMin - bMin || a.name.localeCompare(b.name)
        })
        break
      case "price_high":
        result.sort((a, b) => {
          const aMax = (getSalonPriceRange(a.id, filters) || parsePriceRange(a.price_range)).max
          const bMax = (getSalonPriceRange(b.id, filters) || parsePriceRange(b.price_range)).max
          return bMax - aMax || a.name.localeCompare(b.name)
        })
        break
      default:
        result.sort((a, b) => b.total_bookings - a.total_bookings || a.name.localeCompare(b.name))
    }

    return result
  }, [filters])

  const visibleSalons = filteredSalons.slice(0, visibleCount)
  const compareSalons = useMemo(
    () => compareIds
      .map((id) => PUBLIC_SALONS.find((salon) => salon.id === id))
      .filter(Boolean) as Salon[],
    [compareIds]
  )
  const hasMore = visibleCount < filteredSalons.length
  const activeFilterCount = [
    filters.area,
    filters.service_type,
    filters.gender,
    filters.luxury_level,
    filters.offers_home_service,
    filters.min_rating > 0 ? "rating" : "",
    filters.min_price > 0 ? "price" : "",
    filters.max_price < 100000 ? "price" : "",
  ].filter(Boolean).length

  const clearFilters = () => {
    setFilters({ ...defaultFilters })
    setVisibleCount(8)
  }

  const updateFilter = (key: keyof SearchFilters, value: string | number | boolean | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setVisibleCount(8)
  }

  const toggleCompare = (salon: Salon) => {
    setCompareIds((current) => {
      if (current.includes(salon.id)) return current.filter((id) => id !== salon.id)
      return [...current.slice(-2), salon.id]
    })
  }

  const toggleRating = (rating: number) => {
    setFilters((prev) => ({
      ...prev,
      min_rating: prev.min_rating === rating ? 0 : rating,
    }))
    setVisibleCount(8)
  }

  return (
    <GlowAppShell className="bg-[linear-gradient(180deg,#fffaf5_0%,#fffdf9_34%,#fffaf5_100%)]">
      <ExploreHero filters={filters} updateFilter={updateFilter} />

      <div className="sticky top-16 z-40 border-y border-[#ead8c5]/80 bg-white/88 shadow-[0_12px_40px_rgba(45,29,24,0.06)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FilterBar
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            activeFilterCount={activeFilterCount}
            showMobileFilters={showMobileFilters}
            setShowMobileFilters={setShowMobileFilters}
            toggleRating={toggleRating}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AreaQuickChips filters={filters} updateFilter={updateFilter} />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#6f5d56]">
            Showing <span className="font-semibold text-[#201717]">{visibleSalons.length}</span> of{" "}
            <span className="font-semibold text-[#201717]">{filteredSalons.length}</span> salons
          </p>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 w-full justify-center rounded-full border-[#ead8c5] bg-white text-[#4b3a36] sm:w-auto"
            onClick={() => compareSalons.length >= 2 && setCompareOpen(true)}
            disabled={compareSalons.length < 2}
          >
            <GitCompareArrows className="mr-1.5 h-4 w-4" />
            Compare {compareSalons.length > 0 ? `(${compareSalons.length})` : "2-3 salons"}
          </Button>
        </div>

        {visibleSalons.length === 0 ? (
          <EmptyState clearFilters={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
              {visibleSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  compareSelected={compareIds.includes(salon.id)}
                  onCompare={toggleCompare}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <Button
                  variant="outline"
                  className="rounded-full px-8 h-11"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                >
                  Load More Salons
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <GlowCompareBar
        salons={compareSalons}
        onClear={() => setCompareIds([])}
        onCompare={() => setCompareOpen(true)}
      />

      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} salons={compareSalons} />
    </GlowAppShell>
  )
}

function ExploreHero({
  filters,
  updateFilter,
}: {
  filters: SearchFilters
  updateFilter: (key: keyof SearchFilters, value: string) => void
}) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_12%_12%,rgba(244,183,64,0.22),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(167,139,250,0.18),transparent_28%),linear-gradient(135deg,#fffaf5,#fffdf9_52%,#fff1f5)] py-8 sm:py-14">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-full text-center sm:max-w-3xl">
          <div className="mb-4 inline-flex max-w-[21rem] items-center justify-center gap-1.5 rounded-full border border-[#ead8c5] bg-white/75 px-3 py-1.5 text-center text-[11px] font-semibold leading-tight text-[#7d5b17] shadow-sm backdrop-blur sm:max-w-full sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#db2777]" />
            <span className="min-w-0 sm:hidden">
              {PUBLIC_SALONS.length} verified salons · Smart booking
            </span>
            <span className="hidden min-w-0 sm:inline">
              {PUBLIC_SALONS.length} verified demo salons · Smart capacity-aware booking
            </span>
          </div>
          <h1 className="mx-auto max-w-[21rem] text-[2rem] font-semibold leading-tight tracking-tight text-[#201717] [overflow-wrap:anywhere] sm:max-w-3xl sm:text-5xl lg:text-6xl">
            Discover verified salons in <span className="text-[#b71b62]">Mumbai</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[21rem] text-sm leading-6 text-[#6f5d56] sm:max-w-2xl sm:text-lg">
            Filter by service, area, price, trust score, and availability signals before choosing where to book.
          </p>

          <div className="mx-auto mt-6 max-w-[21rem] sm:max-w-xl">
            <div className="flex items-center gap-2 rounded-full border border-[#ead8c5]/90 bg-white/88 p-2 shadow-[0_20px_60px_rgba(45,29,24,0.10)] backdrop-blur-xl">
              <Search className="ml-3 h-5 w-5 shrink-0 text-[#8f6b25]" />
              <input
                type="text"
                placeholder="Search salons, areas, services..."
                value={filters.query}
                onChange={(e) => updateFilter("query", e.target.value)}
                className="h-10 min-w-0 flex-1 border-0 bg-transparent text-sm text-[#4b3a36] outline-none placeholder:text-[#9f8981]"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => updateFilter("query", "")}
                  className="mr-1 flex min-h-9 min-w-9 items-center justify-center rounded-full hover:bg-[#fff1f5]"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4 text-[#6f5d56]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AreaQuickChips({
  filters,
  updateFilter,
}: {
  filters: SearchFilters
  updateFilter: (key: keyof SearchFilters, value: string) => void
}) {
  const quickAreas = ["Bandra", "Juhu", "Powai", "Andheri", "Colaba", "Lower Parel"]
  return (
    <GlowCard className="mb-5 p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#6f5d56]">
        <MapPinned className="h-4 w-4 text-[#8f6b25]" />
        Location sorting is demo-safe. Choose your Mumbai area.
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => updateFilter("area", "")}
          className={cn(
            "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold",
            !filters.area ? "border-[#d7b982] bg-[#fff8dc] text-[#7d5b17]" : "border-[#ead8c5] bg-white text-[#6f5d56]"
          )}
        >
          All areas
        </button>
        {quickAreas.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => updateFilter("area", filters.area === area ? "" : area)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold",
              filters.area === area ? "border-[#d7b982] bg-[#fff8dc] text-[#7d5b17]" : "border-[#ead8c5] bg-white text-[#6f5d56]"
            )}
          >
            {area}
          </button>
        ))}
      </div>
    </GlowCard>
  )
}

function FilterBar({
  filters,
  updateFilter,
  clearFilters,
  activeFilterCount,
  showMobileFilters,
  setShowMobileFilters,
  toggleRating,
}: {
  filters: SearchFilters
  updateFilter: (key: keyof SearchFilters, value: string | number | boolean | null) => void
  clearFilters: () => void
  activeFilterCount: number
  showMobileFilters: boolean
  setShowMobileFilters: (v: boolean) => void
  toggleRating: (r: number) => void
}) {
  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Area</label>
        <select
          value={filters.area}
          onChange={(e) => updateFilter("area", e.target.value)}
          className="h-11 w-full rounded-xl border border-[#ead8c5] bg-white px-3 text-sm text-[#4b3a36] outline-none focus:border-[#db2777]"
        >
          <option value="">All Areas</option>
          {MUMBAI_AREAS.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Service Type</label>
        <select
          value={filters.service_type}
          onChange={(e) => updateFilter("service_type", e.target.value)}
          className="h-11 w-full rounded-xl border border-[#ead8c5] bg-white px-3 text-sm text-[#4b3a36] outline-none focus:border-[#db2777]"
        >
          <option value="">All Services</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ""}
            onChange={(e) => updateFilter("min_price", Number(e.target.value) || 0)}
            className="h-11 w-full rounded-xl border border-[#ead8c5] bg-white px-3 text-sm text-[#4b3a36] outline-none focus:border-[#db2777]"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price >= 100000 ? "" : filters.max_price}
            onChange={(e) => updateFilter("max_price", Number(e.target.value) || 100000)}
            className="h-11 w-full rounded-xl border border-[#ead8c5] bg-white px-3 text-sm text-[#4b3a36] outline-none focus:border-[#db2777]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
          Minimum Rating
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => toggleRating(r)}
              className={cn(
                "flex size-11 items-center justify-center rounded-xl border text-xs font-medium transition-all",
                filters.min_rating === r
                  ? "border-yellow-400 bg-yellow-50 text-yellow-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              {r}
              <Star className="w-3 h-3 ml-0.5 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Gender</label>
        <div className="flex gap-2">
          {(["women", "men", "unisex"] as const).map((g) => (
            <button
              key={g}
              onClick={() => updateFilter("gender", filters.gender === g ? "" : g)}
              className={cn(
                "min-h-11 flex-1 rounded-xl border text-sm font-medium transition-all",
                filters.gender === g
                  ? "border-glowgo-pink bg-glowgo-pink/10 text-glowgo-pink"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.luxury_level === "luxury"}
            onChange={(e) => updateFilter("luxury_level", e.target.checked ? "luxury" as const : "")}
            className="w-4 h-4 rounded border-gray-300 text-glowgo-pink focus:ring-glowgo-pink"
          />
          <span className="text-sm text-gray-700">Luxury Salons Only</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.offers_home_service === true}
            onChange={(e) => updateFilter("offers_home_service", e.target.checked ? true : null)}
            className="w-4 h-4 rounded border-gray-300 text-glowgo-pink focus:ring-glowgo-pink"
          />
          <span className="text-sm text-gray-700">Home Service Available</span>
        </label>
      </div>

      <Button
        variant="outline"
        className="min-h-11 w-full rounded-xl text-sm"
        onClick={clearFilters}
      >
        Clear All Filters
        <X className="w-3.5 h-3.5 ml-1.5" />
      </Button>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            <select
              value={filters.area}
              onChange={(e) => updateFilter("area", e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-glowgo-pink"
            >
              <option value="">All Areas</option>
              {MUMBAI_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={filters.service_type}
              onChange={(e) => updateFilter("service_type", e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-glowgo-pink"
            >
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRating(r)}
                  className={cn(
                    "flex items-center gap-0.5 h-8 px-2 rounded-lg border text-xs font-medium transition-all",
                    filters.min_rating === r
                      ? "border-yellow-400 bg-yellow-50 text-yellow-600"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  <Star className="w-3 h-3 fill-current" />
                  {r}+
                </button>
              ))}
            </div>

            <select
              value={filters.sort_by}
              onChange={(e) => updateFilter("sort_by", e.target.value)}
              className="h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-glowgo-pink"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="trust_score">Highest Trust</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X className="w-3 h-3" />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-lg bg-gray-100 p-1.5 text-gray-900" aria-label="Grid view active">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg px-2 py-1.5 text-xs text-gray-400"
              title="Map view requires the planned maps integration"
            >
              Map view · demo only
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden py-3">
        <div className="flex items-center gap-3">
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger className="relative inline-flex min-h-11 items-center justify-center rounded-full border border-[#ead8c5] bg-white px-4 text-sm font-semibold text-[#4b3a36] transition-colors hover:bg-[#fffdf9]">
              <SlidersHorizontal className="w-4 h-4 mr-1.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-glowgo-pink text-white text-[10px] flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[86vh] rounded-t-[1.5rem] border-[#ead8c5] bg-[#fffdf9]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 overflow-y-auto flex-1">{filterContent}</div>
            </SheetContent>
          </Sheet>

          <select
            value={filters.sort_by}
            onChange={(e) => updateFilter("sort_by", e.target.value)}
            className="min-h-11 flex-1 rounded-full border border-[#ead8c5] bg-white px-3 text-xs text-[#4b3a36] outline-none focus:border-[#db2777]"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="trust_score">Highest Trust</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>

          <button
            type="button"
            disabled
            className="min-h-11 cursor-not-allowed rounded-full border border-[#ead8c5] px-3 py-2 text-xs text-[#9f8981]"
            title="Map view requires the planned maps integration"
          >
            Map · demo
          </button>
        </div>
      </div>
    </>
  )
}

function CompareDialog({
  open,
  onOpenChange,
  salons,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  salons: Salon[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-[1.35rem] border-[#ead8c5] bg-[#fffdf9] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#201717]">
            <GitCompareArrows className="h-5 w-5 text-[#8f6b25]" />
            Compare salons
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-3">
          {salons.map((salon) => {
            const metrics = computeSalonMetrics(salon.id, true)
            const topServices = SERVICES.filter((service) => service.salon_id === salon.id && isPublicService(service)).slice(0, 3)
            const activeOffers = OFFERS.filter((offer) => offer.salon_id === salon.id && offer.is_active)
            const prices = topServices.map((service) => service.final_price || service.discounted_price || service.price).filter(Boolean)
            const priceLabel = prices.length
              ? `${formatPrice(Math.min(...prices))}${prices.length > 1 ? `-${formatPrice(Math.max(...prices))}` : ""}`
              : salon.price_range || "Price on request"

            return (
              <div key={salon.id} className="rounded-2xl border border-[#ead8c5] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#201717]">{salon.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#6f5d56]">
                      <MapPinned className="h-3.5 w-3.5" />
                      {salon.area}
                    </p>
                  </div>
                  <Badge className="border-0 bg-emerald-50 text-emerald-700">
                    {salon.verified ? "Demo verified" : "Pending"}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-[#fff8dc] p-3">
                    <p className="text-[11px] text-[#6f5d56]">Rating</p>
                    <p className="font-semibold text-[#201717]">{salon.rating_avg.toFixed(1)} ({salon.review_count})</p>
                  </div>
                  <div className="rounded-xl bg-[#f5f1ff] p-3">
                    <p className="text-[11px] text-[#6f5d56]">Trust score</p>
                    <p className="font-semibold text-[#201717]">{metrics.trust_score}/100</p>
                  </div>
                  <div className="rounded-xl bg-pink-50 p-3">
                    <p className="text-[11px] text-[#6f5d56]">Price</p>
                    <p className="font-semibold text-[#201717]">{priceLabel}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-[11px] text-[#6f5d56]">Offers</p>
                    <p className="font-semibold text-[#201717]">{activeOffers.length || "None"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Trust Passport</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Verified", "Hygiene", "Policy", "Reviews"].map((chip) => (
                      <span key={chip} className="rounded-full border border-glowgo-border bg-white px-2 py-1 text-[10px] text-gray-600">
                        <ShieldCheck className="mr-1 inline h-3 w-3 text-emerald-600" />
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-semibold uppercase text-gray-500">Top services</p>
                  {topServices.length > 0 ? topServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                      <span className="truncate">{service.name}</span>
                      <span className="font-semibold">{formatPrice(service.final_price || service.price)}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-500">No active services</p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {activeOffers.length > 0 && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                      <Tag className="mr-1 h-3 w-3" />
                      Offer available
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EmptyState({ clearFilters }: { clearFilters: () => void }) {
  return (
    <GlowEmptyState
      icon={<Search className="h-6 w-6" />}
      title="No salons found"
      copy="We could not find verified public salons matching those filters. Try a broader area, service, or price range."
      action={<GlowButton variant="secondary" onClick={clearFilters}>Clear all filters</GlowButton>}
    />
  )
}

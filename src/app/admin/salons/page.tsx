"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { SalonApprovalCard } from "@/components/admin/salon-approval-card"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate, getInitials } from "@/lib/utils"
import {
  Store,
  Search,
  MapPin,
  Star,
  Eye,
  Check,
  X,
  Sparkles,
} from "lucide-react"
import { useDemoSalonStatuses } from "@/lib/demo-salon-status"
import type { SalonStatus } from "@/types"

const statusFilters: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Featured", value: "featured" },
]

export default function AdminSalons() {
  const { salons, updateStatus } = useDemoSalonStatuses()
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = salons.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.area.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleAction = (id: string, newStatus: SalonStatus) => updateStatus(id, newStatus)

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Salons</h1>
        <p className="text-sm text-muted-foreground">
          Moderate the seeded salon catalog in this browser demo
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border p-0.5">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-glowgo-pink text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No salons found"
          description={
            search
              ? `No salons matching "${search}"`
              : "No salons with this status"
          }
        />
      ) : statusFilter === "pending" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((salon) => (
            <SalonApprovalCard
              key={salon.id}
              salon={salon}
              ownerName="Salon Owner"
              onApprove={(id) => handleAction(id, "approved")}
              onReject={(id) => handleAction(id, "rejected")}
              onFeature={(id) => handleAction(id, "featured")}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Salon
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Area
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Bookings
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((salon) => (
                  <tr
                    key={salon.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarImage src={salon.logo_url} alt={salon.name} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(salon.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{salon.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Owner #{salon.owner_id.slice(-4)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {salon.area}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={salon.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="size-3 fill-current" />
                        {salon.rating_avg}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {salon.total_bookings}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(salon.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {salon.status === "pending" && (
                          <>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-emerald-600"
                              onClick={() =>
                                handleAction(salon.id, "approved")
                              }
                            >
                              <Check className="size-3.5" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() =>
                                handleAction(salon.id, "rejected")
                              }
                            >
                              <X className="size-3.5" />
                            </Button>
                          </>
                        )}
                        {salon.status === "approved" && (
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              handleAction(salon.id, "featured")
                            }
                          >
                            <Sparkles className="size-3.5" />
                          </Button>
                        )}
                        <Link href={`/salon/${salon.id}`} aria-label={`View ${salon.name}`}>
                          <Button size="xs" variant="ghost">
                            <Eye className="size-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Moderation changes persist in this browser and do not represent production publication controls.
      </p>
    </div>
  )
}

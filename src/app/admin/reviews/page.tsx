"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { formatDate, getInitials } from "@/lib/utils"
import { useDemoReviews } from "@/lib/use-demo-reviews"
import {
  MessageSquare,
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react"
import { SALONS } from "@/data"

const filterTabs = [
  { label: "All", value: "all" },
  { label: "Reported", value: "reported" },
  { label: "Moderated", value: "moderated" },
]

export default function AdminReviews() {
  const [isLoading] = useState(false)
  const { reviews, moderateReview, updateReview } = useDemoReviews()
  const [filter, setFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filtered = reviews.filter((r) => {
    if (filter === "reported") return r.is_reported
    if (filter === "moderated") return r.is_moderated || r.status === "rejected"
    return true
  })

  const handleModerate = async (id: string, moderated: boolean) => {
    setActionLoading(id)
    await new Promise((r) => setTimeout(r, 400))
    moderateReview(id, moderated ? "rejected" : "approved")
    setActionLoading(null)
  }

  const handleDismissReport = async (id: string) => {
    setActionLoading(id)
    await new Promise((r) => setTimeout(r, 400))
    updateReview(id, { is_reported: false })
    setActionLoading(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Reviews</h1>
        <LoadingSkeleton type="list" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Moderate customer reviews across all salons
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-0.5">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === t.value
                  ? "bg-glowgo-pink text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description={
            filter === "reported"
              ? "No reported reviews"
              : filter === "moderated"
                ? "No moderated reviews"
                : "No reviews yet"
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar size="default">
                      <AvatarImage src={review.user?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(review.user?.full_name || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {review.user?.full_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {review.title && (
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {review.title}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>
                          {SALONS.find((salon) => salon.id === review.salon_id)?.name ||
                            `Salon #${review.salon_id.slice(-4)}`}
                        </span>
                        <Badge variant="outline" className="h-4 px-1 text-[9px] capitalize">
                          {review.status}
                        </Badge>
                        {review.is_verified && (
                          <Badge
                            variant="secondary"
                            className="h-4 gap-0.5 px-1 text-[9px]"
                          >
                            <CheckCircle className="size-2.5" />
                            Verified
                          </Badge>
                        )}
                        {review.is_reported && (
                          <Badge
                            variant="secondary"
                            className="h-4 gap-0.5 border-red-200 bg-red-50 px-1 text-[9px] text-red-600"
                          >
                            <AlertTriangle className="size-2.5" />
                            Reported
                          </Badge>
                        )}
                        {(review.is_moderated || review.status === "rejected") && (
                          <Badge
                            variant="secondary"
                            className="h-4 gap-0.5 px-1 text-[9px]"
                          >
                            <EyeOff className="size-2.5" />
                            Moderated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {actionLoading === review.id ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        {review.is_moderated ? (
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleModerate(review.id, false)}
                          >
                            <Eye className="size-3.5" />
                            Show
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => handleModerate(review.id, true)}
                          >
                            <EyeOff className="size-3.5" />
                            Hide
                          </Button>
                        )}
                        {review.is_reported && (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-emerald-600"
                            onClick={() => handleDismissReport(review.id)}
                          >
                            <X className="size-3.5" />
                            Dismiss
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

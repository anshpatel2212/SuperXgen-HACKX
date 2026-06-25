"use client"

import Image from "next/image"
import { Star, ThumbsUp, Flag, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, getInitials } from "@/lib/utils"
import type { Review } from "@/types"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.user?.avatar_url || ""} alt={review.user?.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white text-xs">
              {getInitials(review.user?.full_name || "U")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{review.user?.full_name}</span>
              {review.is_verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-3 h-3",
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  )}
                />
              ))}
              <span className="text-[10px] text-gray-400 ml-1">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>
        {review.is_verified && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-[10px]">
            <BadgeCheck className="w-3 h-3 mr-0.5" />
            Verified
          </Badge>
        )}
      </div>

      {review.title && (
        <h4 className="text-sm font-medium text-gray-900 mt-3">{review.title}</h4>
      )}
      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={img}
                alt={`Review image ${i + 1}`}
                width={64}
                height={64}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful
        </button>
        <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
          <Flag className="w-3.5 h-3.5" />
          Report
        </button>
      </div>
    </div>
  )
}

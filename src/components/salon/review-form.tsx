"use client"

import { useState } from "react"
import { Star, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  salonName: string
  onSubmit?: (data: { rating: number; title: string; comment: string }) => Promise<void>
  onCancel?: () => void
}

export function ReviewForm({ salonName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit({ rating, title, comment })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Rate your experience</h3>
        <p className="text-sm text-gray-500 mt-1">{salonName}</p>
      </div>

      <div className="flex justify-center gap-1.5 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200 hover:text-yellow-200"
              )}
            />
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-comment">Review</Label>
        <Textarea
          id="review-comment"
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photos (optional)</Label>
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-glowgo-pink hover:text-glowgo-pink transition-colors"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-sm">Add photos</span>
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className="flex-1 bg-gradient-to-r from-glowgo-pink to-glowgo-lavender text-white hover:opacity-90 shadow-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  )
}

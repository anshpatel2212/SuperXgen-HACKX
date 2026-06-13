"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { SalonForm } from "@/components/owner/salon-form"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Store } from "lucide-react"
import { SALONS } from "@/data"
import type { Salon } from "@/types"

export default function EditSalonPage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const salon = SALONS.find((s) => s.id === params.id)
  const isOwner = salon && salon.owner_id === user?.id

  if (authLoading) {
    return <LoadingSkeleton type="detail" />
  }

  if (!salon) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Salon Not Found</h1>
          </div>
        </div>
        <EmptyState
          icon={Store}
          title="Salon not found"
          description="The salon you're looking for doesn't exist."
          actionLabel="Go Back"
          onAction={() => router.push("/owner/salons")}
        />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Access Denied</h1>
          </div>
        </div>
        <EmptyState
          icon={Store}
          title="Access Denied"
          description="You don't have permission to edit this salon."
          actionLabel="Go Back"
          onAction={() => router.push("/owner/salons")}
        />
      </div>
    )
  }

  const handleSave = async (data: Partial<Salon>) => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsSaving(false)
    router.push("/owner/salons")
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">
            {salon ? `Edit ${salon.name}` : "Edit Salon"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your salon details and preferences
          </p>
        </div>
      </div>
      <SalonForm salon={salon} onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}

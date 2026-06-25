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
import { updateSalon } from "@/lib/data-service"
import type { Salon } from "@/types"

export default function EditSalonPage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

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
    setSaveError("")
    try {
      const updated = updateSalon(salon.id, data)
      if (!updated) {
        setSaveError("Unable to save this salon. Please try again.")
        return
      }
      router.push("/owner/salons")
    } catch {
      setSaveError("Unable to save this salon. Please try again.")
    } finally {
      setIsSaving(false)
    }
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
      {saveError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
      <SalonForm salon={salon} onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}

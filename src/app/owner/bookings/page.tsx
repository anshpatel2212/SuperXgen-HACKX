"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate, formatTime, formatPrice, getInitials } from "@/lib/utils"
import {
  CalendarCheck,
  Check,
  X,
  Loader2,
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  FileText,
  Store,
} from "lucide-react"
import { SALONS } from "@/data"
import { DEMO_ACCOUNTS } from "@/config/demo-auth"
import { useAuth } from "@/lib/auth-context"
import { useDemoBookings } from "@/lib/demo-bookings"
import type { BookingStatus, Salon } from "@/types"

const statusTabs: { label: string; value: string; filter?: BookingStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending", filter: "pending" },
  { label: "Confirmed", value: "confirmed", filter: "confirmed" },
  { label: "Completed", value: "completed", filter: "completed" },
  { label: "Cancelled", value: "cancelled", filter: "cancelled" },
]

export default function OwnerBookings() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const ownerSalons: Salon[] = SALONS.filter((s) => s.owner_id === (user?.id || ""))
  const ownerSalonIds = ownerSalons.map((s) => s.id)
  const { bookings, updateStatus } = useDemoBookings({ salonIds: ownerSalonIds })
  const [activeTab, setActiveTab] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null)

  const filtered =
    activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab)

  const handleStatusUpdate = async (id: string, newStatus: BookingStatus) => {
    setActionLoading(id)
    try {
      updateStatus(id, newStatus)
    } catch {
      // The confirmation dialog remains the visible failure boundary in demo mode.
    }
    setActionLoading(null)
    setConfirmAction(null)
  }

  if (authLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">Loading bookings…</div>
    )
  }

  if (ownerSalons.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No salons yet"
        description="Create a salon first to start receiving bookings"
        actionLabel="Go to Salons"
        onAction={() => router.push("/owner/onboarding")}
      />
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Manage customer appointments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tab.filter && (
                <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 text-[10px]">
                  {bookings.filter((b) => b.status === tab.filter).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No bookings found"
              description={
                activeTab === "all"
                  ? "You haven't received any bookings yet"
                  : `No ${activeTab} bookings`
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => {
                const customer = DEMO_ACCOUNTS.find((account) => account.user.id === booking.user_id)?.user
                const customerName = customer?.full_name || "Demo Customer"
                return (
                <Card key={booking.id} className="transition-shadow hover:shadow-sm">
                  <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {customerName}
                          </p>
                          <StatusBadge
                            status={booking.status}
                            size="sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {booking.service?.name || "Service"}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(booking.booking_date)} at{" "}
                            {formatTime(booking.booking_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="size-3" />
                            {formatPrice(booking.total_price)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {customer?.phone || "Demo contact unavailable"}
                          </span>
                        </div>
                        {booking.address_text && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="size-3" />
                            {booking.address_text}
                          </p>
                        )}
                        {booking.notes && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <FileText className="size-3" />
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={actionLoading === booking.id}
                            onClick={() =>
                              setConfirmAction({
                                id: booking.id,
                                action: "confirmed",
                              })
                            }
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            disabled={actionLoading === booking.id}
                            onClick={() =>
                              setConfirmAction({
                                id: booking.id,
                                action: "cancelled",
                              })
                            }
                          >
                            <X className="size-3.5" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={actionLoading === booking.id}
                          onClick={() =>
                            setConfirmAction({
                              id: booking.id,
                              action: "completed",
                            })
                          }
                        >
                          {actionLoading === booking.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "cancelled"
                ? "Cancel Booking"
                : confirmAction?.action === "completed"
                  ? "Complete Booking"
                  : "Confirm Booking"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "cancelled"
                ? "Are you sure you want to cancel this booking?"
                : confirmAction?.action === "completed"
                  ? "Mark this booking as completed?"
                  : "Confirm this booking?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
            >
              No, go back
            </Button>
            <Button
              variant={
                confirmAction?.action === "cancelled"
                  ? "destructive"
                  : "default"
              }
              onClick={() => {
                if (confirmAction) {
                  handleStatusUpdate(
                    confirmAction.id,
                    confirmAction.action as BookingStatus
                  )
                }
              }}
            >
              Yes,{" "}
              {confirmAction?.action === "cancelled"
                ? "Cancel"
                : confirmAction?.action === "completed"
                  ? "Complete"
                  : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

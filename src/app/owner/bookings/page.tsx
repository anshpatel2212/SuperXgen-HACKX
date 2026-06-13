"use client"

import { useState } from "react"
import Link from "next/link"
import { updateBookingInStore } from "@/lib/api-client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
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
import { useAuth } from "@/lib/auth-context"
import type { BookingStatus, Salon } from "@/types"

interface BookingItem {
  id: string
  customer: string
  customerPhone: string
  service: string
  date: string
  time: string
  status: BookingStatus
  amount: number
  address?: string
  notes?: string
  salon_id?: string
}

const allBookings: BookingItem[] = [
  { id: "b1", customer: "Priya Sharma", customerPhone: "+91 98765 43210", service: "Classic Haircut", date: "2025-06-10", time: "10:00", status: "confirmed", amount: 800, salon_id: "1" },
  { id: "b2", customer: "Rahul Verma", customerPhone: "+91 98765 43211", service: "Bridal Makeup", date: "2025-06-09", time: "14:00", status: "completed", amount: 12000, notes: "Please use hypoallergenic products", salon_id: "1" },
  { id: "b3", customer: "Neha Gupta", customerPhone: "+91 98765 43212", service: "Luxury Facial", date: "2025-06-08", time: "11:30", status: "completed", amount: 1999, salon_id: "1" },
  { id: "b4", customer: "Vikram Singh", customerPhone: "+91 98765 43213", service: "Hair Color", date: "2025-06-07", time: "16:00", status: "pending", amount: 3500, salon_id: "1" },
  { id: "b5", customer: "Ananya Patel", customerPhone: "+91 98765 43214", service: "Manicure Combo", date: "2025-06-06", time: "09:00", status: "cancelled", amount: 1200, salon_id: "1" },
  { id: "b6", customer: "Kavita Desai", customerPhone: "+91 98765 43215", service: "Hair Spa", date: "2025-06-12", time: "15:30", status: "pending", amount: 1800, address: "Bandra West, Mumbai", salon_id: "1" },
]

const statusTabs: { label: string; value: string; filter?: BookingStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending", filter: "pending" },
  { label: "Confirmed", value: "confirmed", filter: "confirmed" },
  { label: "Completed", value: "completed", filter: "completed" },
  { label: "Cancelled", value: "cancelled", filter: "cancelled" },
]

export default function OwnerBookings() {
  const { user, isLoading: authLoading } = useAuth()

  const ownerSalons: Salon[] = SALONS.filter((s) => s.owner_id === (user?.id || ""))
  const ownerSalonIds = ownerSalons.map((s) => s.id)

  const ownerBookings = allBookings.filter((b) => ownerSalonIds.includes(b.salon_id || ""))

  const [isLoading, setIsLoading] = useState(false)
  const [bookings, setBookings] = useState(ownerBookings)
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
      updateBookingInStore(id, { status: newStatus })
      await new Promise((r) => setTimeout(r, 600))
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      )
    } catch (err) {
      console.error("Failed to update booking:", err)
    }
    setActionLoading(null)
    setConfirmAction(null)
  }

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Bookings</h1>
        <LoadingSkeleton type="list" />
      </div>
    )
  }

  if (ownerSalons.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No salons yet"
        description="Create a salon first to start receiving bookings"
        actionLabel="Go to Salons"
        onAction={() => {}}
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
              {filtered.map((booking) => (
                <Card key={booking.id} className="transition-shadow hover:shadow-sm">
                  <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar size="default">
                        <AvatarFallback>
                          {getInitials(booking.customer)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {booking.customer}
                          </p>
                          <StatusBadge
                            status={booking.status}
                            size="sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {booking.service}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDate(booking.date)} at{" "}
                            {formatTime(booking.time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="size-3" />
                            {formatPrice(booking.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {booking.customerPhone}
                          </span>
                        </div>
                        {booking.address && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="size-3" />
                            {booking.address}
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
              ))}
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

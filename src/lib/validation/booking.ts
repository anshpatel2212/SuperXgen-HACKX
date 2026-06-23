import { z } from "zod"

const demoOfferSchema = z.object({
  id: z.string().trim().min(1),
  salon_id: z.string().trim().min(1),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().positive(),
  min_purchase: z.number().min(0),
  max_discount: z.number().min(0),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_till: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_active: z.boolean(),
})

const demoSlotSchema = z.object({
  id: z.string().trim().min(1),
  salon_id: z.string().trim().min(1),
  service_id: z.string().trim().min(1).nullable(),
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  is_available: z.boolean(),
  capacity: z.number().int().positive(),
  booked_count: z.number().int().min(0),
})

export const createBookingSchema = z
  .object({
    user_id: z.string().trim().min(1, "User is required"),
    salon_id: z.string().trim().min(1, "Salon is required"),
    service_id: z.string().trim().min(1, "Service is required"),
    booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD for the booking date"),
    booking_time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM for the booking time"),
    service_mode: z.enum(["salon", "home"]).default("salon"),
    address_text: z.string().trim().max(500).default(""),
    notes: z.string().trim().max(1000).default(""),
    offer_id: z.string().trim().min(1).nullable().optional(),
    demo_offer: demoOfferSchema.optional(),
    slot_id: z.string().trim().min(1).nullable().optional(),
    demo_slot: demoSlotSchema.optional(),
  })
  .superRefine((booking, context) => {
    if (booking.service_mode === "home" && booking.address_text.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["address_text"],
        message: "A complete home-service address is required",
      })
    }

    if (booking.offer_id && booking.demo_offer && booking.demo_offer.id !== booking.offer_id) {
      context.addIssue({
        code: "custom",
        path: ["demo_offer"],
        message: "Offer details do not match the selected offer",
      })
    }

    if (booking.offer_id && booking.demo_offer && booking.demo_offer.salon_id !== booking.salon_id) {
      context.addIssue({
        code: "custom",
        path: ["demo_offer"],
        message: "This offer does not belong to the selected salon",
      })
    }

    if (Boolean(booking.slot_id) !== Boolean(booking.demo_slot)) {
      context.addIssue({
        code: "custom",
        path: ["demo_slot"],
        message: "Slot details are required for managed availability",
      })
    }

    if (booking.slot_id && booking.demo_slot) {
      if (booking.demo_slot.id !== booking.slot_id) {
        context.addIssue({
          code: "custom",
          path: ["demo_slot"],
          message: "Slot details do not match the selected slot",
        })
      }
      if (
        booking.demo_slot.salon_id !== booking.salon_id ||
        booking.demo_slot.slot_date !== booking.booking_date ||
        booking.demo_slot.start_time !== booking.booking_time ||
        (booking.demo_slot.service_id &&
          booking.demo_slot.service_id !== booking.service_id)
      ) {
        context.addIssue({
          code: "custom",
          path: ["demo_slot"],
          message: "This slot is not valid for the selected booking",
        })
      }
      if (
        !booking.demo_slot.is_available ||
        booking.demo_slot.booked_count >= booking.demo_slot.capacity
      ) {
        context.addIssue({
          code: "custom",
          path: ["demo_slot"],
          message: "This slot is no longer available",
        })
      }
    }
  })

export type CreateBookingInput = z.input<typeof createBookingSchema>

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
  })

export type CreateBookingInput = z.input<typeof createBookingSchema>

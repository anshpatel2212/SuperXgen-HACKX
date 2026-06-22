import { z } from "zod"

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
  })
  .superRefine((booking, context) => {
    if (booking.service_mode === "home" && booking.address_text.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["address_text"],
        message: "A complete home-service address is required",
      })
    }
  })

export type CreateBookingInput = z.input<typeof createBookingSchema>

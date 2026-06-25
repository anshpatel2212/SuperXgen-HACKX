import { SERVICES } from "@/data"
import type { Salon, Service } from "@/types"

export function hasBookableServices(salonId: string, services: Service[] = SERVICES) {
  return services.some(
    (service) =>
      service.salon_id === salonId &&
      service.active &&
      service.name.trim().length >= 3 &&
      service.category.trim().length > 0 &&
      service.duration_minutes > 0 &&
      (service.final_price || service.discounted_price || service.price) > 0
  )
}

export function isPublicSalon(salon: Salon, services: Service[] = SERVICES) {
  const approvedStatus = salon.status === "approved" || salon.status === "featured"
  return approvedStatus && salon.verified && hasBookableServices(salon.id, services)
}

export function getPublicSalons(salons: Salon[], services: Service[] = SERVICES) {
  return salons.filter((salon) => isPublicSalon(salon, services))
}

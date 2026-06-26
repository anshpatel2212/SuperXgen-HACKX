import { SERVICES } from "@/data"
import { cleanGlowImageUrls } from "@/lib/glow-images"
import type { Salon, Service } from "@/types"

function isClearlyPlaceholderName(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized.length < 3 || normalized === "dddd" || normalized === "dv"
}

function getServicePrice(service: Service) {
  return service.final_price || service.discounted_price || service.price
}

export function isPublicService(service: Service) {
  const price = getServicePrice(service)
  const serviceName = service.name.trim().toLowerCase()

  return (
    service.active &&
    service.name.trim().length >= 3 &&
    serviceName !== "dv" &&
    service.category.trim().length > 0 &&
    service.duration_minutes > 0 &&
    price > 0
  )
}

export function hasBookableServices(salonId: string, services: Service[] = SERVICES) {
  return services.some(
    (service) =>
      service.salon_id === salonId &&
      isPublicService(service)
  )
}

export function isPublicSalon(salon: Salon, services: Service[] = SERVICES) {
  const approvedStatus = salon.status === "approved" || salon.status === "featured"
  const hasRequiredFields = Boolean(
    salon.name.trim() &&
      !isClearlyPlaceholderName(salon.name) &&
      salon.area.trim() &&
      salon.city.trim() &&
      salon.address.trim() &&
      salon.phone.trim()
  )
  const hasCleanImageSet =
    cleanGlowImageUrls([
      salon.cover_url,
      salon.cover_image,
      salon.logo_url,
      ...(salon.images || []),
      ...(salon.gallery || []),
    ]).length > 0

  return approvedStatus && salon.verified && hasRequiredFields && hasCleanImageSet && hasBookableServices(salon.id, services)
}

export function getPublicSalons(salons: Salon[], services: Service[] = SERVICES) {
  return salons.filter((salon) => isPublicSalon(salon, services))
}

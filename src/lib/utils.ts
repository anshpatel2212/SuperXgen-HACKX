import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function formatDateTime(date: string, time: string): string {
  return `${formatDate(date)} at ${formatTime(time)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 4) return 'text-emerald-600'
  if (rating >= 3) return 'text-yellow-600'
  return 'text-red-600'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'confirmed':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'featured':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function parsePriceRange(range: string): { min: number; max: number } {
  const [min, max] = range.replace(/[₹,\s]/g, '').split('-')
  return { min: parseInt(min) || 0, max: parseInt(max) || 0 }
}

export const MUMBAI_AREAS = [
  'Andheri', 'Bandra', 'Juhu', 'Colaba', 'Powai',
  'Malad', 'Borivali', 'Thane', 'Navi Mumbai', 'Lower Parel',
  'Worli', 'Dadar', 'Chembur', 'Ghatkopar', 'Vile Parle',
  'Santacruz', 'Khar', 'Marine Lines', 'Churchgate', 'Fort'
]

export const SERVICE_CATEGORIES = [
  'Bridal Makeup', 'Facial', 'Haircut', 'Hair Color',
  'Manicure', 'Pedicure', 'Spa', 'Waxing',
  'Threading', 'Bleach', 'Detan', 'Massage',
  'Hair Styling', 'Hair Treatment', 'Nail Art', 'Grooming'
]

export const MUMBAI_CITIES = ['Mumbai', 'Navi Mumbai', 'Thane']

export const AMENITIES_OPTIONS = [
  'WiFi', 'AC', 'Parking', 'Refreshments', 'Valet Parking',
  'Private Rooms', 'Steam Room', 'Sauna', 'Cafe', 'Bar', 'TV Lounge',
  'Consultation Room', 'Wheelchair Accessible', 'Kids Area'
]

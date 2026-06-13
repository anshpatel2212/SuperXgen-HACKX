import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  featured: "bg-purple-100 text-purple-700 border-purple-200",
  rescheduled: "bg-orange-100 text-orange-700 border-orange-200",
  reported: "bg-rose-100 text-rose-700 border-rose-200",
  moderated: "bg-slate-100 text-slate-700 border-slate-200",
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"

  return (
    <Badge
      className={cn(
        "border font-medium capitalize",
        size === "sm" && "h-5 px-1.5 text-[10px]",
        size === "md" && "h-6 px-2 text-xs",
        size === "lg" && "h-7 px-2.5 text-sm",
        style,
        className
      )}
    >
      {status}
    </Badge>
  )
}

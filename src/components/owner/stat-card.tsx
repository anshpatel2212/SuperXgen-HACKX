import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  trend?: { value: number; isPositive: boolean }
  gradient?: string
  className?: string
}

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  gradient = "from-glowgo-pink to-glowgo-lavender",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden", className)}>
      <div
        className={cn(
          "absolute inset-0 opacity-5 bg-gradient-to-br",
          gradient
        )}
      />
      <CardContent className="relative p-4">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg bg-gradient-to-br",
              gradient
            )}
          >
            <Icon className="size-4 text-white" />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="mb-0.5 text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

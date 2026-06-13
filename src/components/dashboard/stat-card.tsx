"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: string
    positive: boolean
  }
  iconBg?: string
  iconColor?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  iconBg = "bg-glowgo-pink/10",
  iconColor = "text-glowgo-pink",
}: StatCardProps) {
  return (
    <Card className="border-gray-100 hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", iconBg)}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}
            >
              {trend.positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

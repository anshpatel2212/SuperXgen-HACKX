"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { getOwnerSalons, recomputeOwnerMetrics } from "@/lib/data-service"
import type { OwnerDashboardMetrics } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Lightbulb, TrendingUp, TrendingDown, BarChart3, Star,
  Clock, IndianRupee, Scissors, Target, Zap, RefreshCw,
  AlertCircle, CheckCircle2, ArrowUpRight
} from "lucide-react"

export default function OwnerInsightsPage() {
  const { user, isLoading } = useAuth()
  const [metrics, setMetrics] = useState<OwnerDashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [advice, setAdvice] = useState<{
    strengths: string[]
    weaknesses: string[]
    pricing_advice: string
    service_mix_advice: string
    marketing_advice: string
    next_actions: string[]
  } | null>(null)

  useEffect(() => {
    if (user && user.role === "owner") {
      loadData()
    }
  }, [user])

  const loadData = () => {
    if (!user) return
    setLoading(true)
    const m = recomputeOwnerMetrics(user.id)
    setMetrics(m)
    generateAdvice(m)
    setLoading(false)
  }

  const generateAdvice = (m: OwnerDashboardMetrics) => {
    const strengths: string[] = []
    const weaknesses: string[] = []

    if (m.trust_score >= 70) strengths.push(`High Trust Score (${m.trust_score}/100) — customers trust your salon`)
    else weaknesses.push(`Trust Score (${m.trust_score}/100) needs improvement — respond faster and get more reviews`)

    if (m.average_rating >= 4.5) strengths.push(`Excellent rating (${m.average_rating}★) — top-tier customer satisfaction`)
    else if (m.average_rating >= 4) strengths.push(`Great rating (${m.average_rating}★) — above average`)
    else if (m.average_rating < 4 && m.total_reviews > 0) weaknesses.push(`Rating (${m.average_rating}★) could improve — focus on service quality`)

    if (m.total_bookings > 50) strengths.push(`${m.total_bookings} total bookings — strong customer demand`)
    else weaknesses.push(`Only ${m.total_bookings} total bookings — need to increase visibility`)

    if (m.slot_utilization_rate > 60) strengths.push(`Slot utilization at ${m.slot_utilization_rate}% — efficient capacity management`)
    else if (m.slot_utilization_rate < 30) weaknesses.push(`Low slot utilization (${m.slot_utilization_rate}%) — too many empty slots`)
    else weaknesses.push(`Slot utilization at ${m.slot_utilization_rate}% — room for improvement`)

    if (m.response_time_minutes <= 30) strengths.push(`Fast response time (${m.response_time_minutes}min) — you're responsive`)
    else weaknesses.push(`Response time (${m.response_time_minutes}min) is slow — try to confirm bookings within 30 minutes`)

    if (m.total_services < 5) weaknesses.push(`Only ${m.total_services} services offered — add more to attract more customers`)
    else strengths.push(`${m.total_services} services offered — good variety`)

    if (m.revenue_total > 0) strengths.push(`₹${m.revenue_total.toLocaleString('en-IN')} lifetime revenue`)
    else weaknesses.push('No revenue yet — focus on getting your first bookings')

    const pricingAdvice = m.average_rating >= 4.5
      ? "Your high ratings justify premium pricing. Consider raising prices slightly to reflect your quality."
      : m.average_rating >= 4
        ? "Your pricing is competitive. Consider offering package deals to increase average order value."
        : "Consider introductory pricing or discounts to attract more customers and build your reputation."

    const serviceMixAdvice = m.top_category
      ? `"${m.top_category}" is your top category — consider expanding related services and creating bundled packages.`
      : "Analyze which services get the most bookings and focus on promoting those."

    const marketingAdvice = m.total_bookings < 20
      ? "Run a 'first visit discount' campaign and encourage customers to leave reviews to build social proof."
      : "Leverage your best reviews in marketing materials. Consider a referral program to drive word-of-mouth."

    const nextActions: string[] = []

    if (m.total_reviews < 5) nextActions.push("Request reviews from recent customers — social proof drives bookings")
    if (m.slot_utilization_rate < 40) nextActions.push("Reduce available slots or promote off-peak hours with discounts")
    if (m.response_time_minutes > 60) nextActions.push("Set up instant booking confirmation to improve response time")
    if (m.top_service) nextActions.push(`Promote "${m.top_service}" — it's your most popular service`)
    if (m.revenue_week < m.revenue_month / 4) nextActions.push("Revenue is declining — run a flash sale to boost this week")
    if (m.total_services < 5) nextActions.push("Add at least 3 more services to appear in more search results")

    if (nextActions.length === 0) nextActions.push("Keep up the great work! Focus on maintaining quality and consistency.")

    setAdvice({ strengths, weaknesses, pricing_advice: pricingAdvice, service_mix_advice: serviceMixAdvice, marketing_advice: marketingAdvice, next_actions: nextActions })
  }

  if (isLoading) return null
  if (!user) redirect("/login")
  if (user.role !== "owner") redirect("/")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" /> AI Insights
          </h1>
          <p className="text-gray-500 text-sm">AI-driven analysis and recommendations for your business</p>
        </div>
        <Button variant="outline" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-full" /></CardContent></Card>
          ))}
        </div>
      ) : metrics && advice ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <div className="text-2xl font-bold">{metrics.average_rating || '—'}</div>
              <div className="text-xs text-gray-500">Avg Rating</div>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{metrics.trust_score}</div>
              <div className="text-xs text-gray-500">Trust Score</div>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{metrics.response_time_minutes}m</div>
              <div className="text-xs text-gray-500">Response Time</div>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <IndianRupee className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">₹{(metrics.revenue_total || 0).toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500">Lifetime Revenue</div>
            </CardContent></Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {advice.strengths.length > 0 ? advice.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </div>
                )) : <p className="text-sm text-gray-400">Complete your profile to see strengths.</p>}
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {advice.weaknesses.length > 0 ? advice.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                )) : <p className="text-sm text-green-600">No major issues found! Great job.</p>}
              </CardContent>
            </Card>
          </div>

          {/* AI Advice */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-pink-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-pink-700">
                  <IndianRupee className="w-4 h-4" /> Pricing Advice
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-gray-700">{advice.pricing_advice}</p></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                  <Scissors className="w-4 h-4" /> Service Mix
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-gray-700">{advice.service_mix_advice}</p></CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" /> Marketing
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-gray-700">{advice.marketing_advice}</p></CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" /> Recommended Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {advice.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-yellow-100">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-yellow-600 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No insights available yet</p>
          <p className="text-sm">Create a salon and get some bookings to see AI-powered insights.</p>
        </div>
      )}
    </div>
  )
}

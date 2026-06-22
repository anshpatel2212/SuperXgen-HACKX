'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles, Bot, Send, Search, Star, MapPin, IndianRupee, Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ChatMessage } from '@/components/ai/chat-message'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice, getInitials } from '@/lib/utils'
import { buildSearchContext, generateFullRecommendation } from '@/services/ai'
import { computeSalonMetrics, computeTrustScoreBadge } from '@/services/calculations'
import { getSalonOffers } from '@/lib/data-service'
import type { Salon, AIIntent } from '@/types'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  recommendations?: { salon: Salon; reason: string }[]
  intent?: AIIntent
  summary?: string
}

const quickActions = [
  {
    icon: Search, label: 'Find Salons',
    prompt: 'Find top-rated salons for bridal makeup in Bandra under ₹10,000',
    gradient: 'from-pink-100 to-rose-50', iconColor: 'text-pink-500',
  },
  {
    icon: Star, label: 'Get Recommendations',
    prompt: 'What do you recommend for glowing skin? I have dry skin',
    gradient: 'from-purple-100 to-violet-50', iconColor: 'text-purple-500',
  },
  {
    icon: Zap, label: 'Popular Now',
    prompt: 'Show me the most popular salons in Mumbai right now',
    gradient: 'from-amber-100 to-orange-50', iconColor: 'text-amber-500',
  },
  {
    icon: MapPin, label: 'Home Service',
    prompt: 'Which salons offer home service in Andheri?',
    gradient: 'from-emerald-100 to-teal-50', iconColor: 'text-emerald-500',
  },
]

const welcomePrompts = [
  "Find me a good salon for a haircut in Bandra",
  "Need bridal makeup under ₹6000 in Andheri this Saturday",
  "What are the best luxury spas in Mumbai?",
  "Show me salons with home service near Powai",
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: "Hi! I'm your GlowGo AI beauty assistant. I'm connected to all our salon data and can help you discover the perfect salon, service, or treatment. What are you looking for today?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || loading) return

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      content: query,
      role: 'user',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      try {
        const { salonContexts, intent } = buildSearchContext(query)
        const rec = generateFullRecommendation(query)

        let replyContent = ''
        const recommendations: { salon: Salon; reason: string }[] = []

        if (rec.top_matches.length === 0) {
          replyContent = rec.summary
        } else {
          const ctxList = salonContexts.filter((context) => context !== null).slice(0, 3)
          replyContent = `### ${rec.summary}\n\n`
          replyContent += ctxList.map((ctx, i: number) => {
            const s = ctx.salon
            const match = rec.top_matches[i]
            recommendations.push({ salon: s, reason: match?.reason || '' })
            return `**${i + 1}. ${s.name}** — ${s.area}\n${match?.reason || ''}\n\n`
          }).join('\n')

          replyContent += `\n✨ **Demo catalog note**: These matches use the current GlowGo sample catalog and calculated salon metrics.`
        }

        const assistantMsg: Message = {
          id: `ai_${Date.now()}`,
          content: replyContent,
          role: 'assistant',
          timestamp: new Date(),
          recommendations: recommendations.length > 0 ? recommendations : undefined,
          intent,
        }
        setMessages(prev => [...prev, assistantMsg])
      } catch {
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          content: "I'm sorry, I encountered an error while searching. Please try again with different keywords.",
          role: 'assistant',
          timestamp: new Date(),
        }])
      } finally {
        setLoading(false)
      }
    }, 600)
  }, [loading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch(input)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Powered by the GlowGo Demo Catalog
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            GlowGo AI Beauty Assistant
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Ask about salons, services, prices, and offers in the current GlowGo demo catalog.
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              <ChatMessage message={msg.content} role={msg.role} />
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-2 ml-8 space-y-2">
                  {msg.recommendations.map((rec, i) => {
                    const metrics = computeSalonMetrics(rec.salon.id)
                    const badge = computeTrustScoreBadge(metrics.trust_score)
                    const offers = getSalonOffers(rec.salon.id)
                    return (
                      <Link key={i} href={`/salon/${rec.salon.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-pink-100">
                          <CardContent className="p-3 flex items-start gap-3">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarImage src={rec.salon.cover_image || rec.salon.logo_url} alt={rec.salon.name} />
                              <AvatarFallback>{getInitials(rec.salon.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{rec.salon.name}</h4>
                                <Badge className={`${badge.color} text-[10px] px-1 py-0`}>{badge.label}</Badge>
                              </div>
                              <p className="text-xs text-gray-500">{rec.salon.area}, {rec.salon.city}</p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rec.reason}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {rec.salon.rating_avg.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  {metrics.min_price > 0
                                    ? `${formatPrice(metrics.min_price)}-${formatPrice(metrics.max_price)}`
                                    : rec.salon.price_range}
                                </span>
                                {offers.length > 0 && (
                                  <span className="text-green-600 font-medium">
                                    {offers.filter(o => o.is_active).length} offer{offers.filter(o => o.is_active).length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex gap-1 items-center py-4">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-3 text-center">Try asking me...</p>
            <div className="flex flex-wrap justify-center gap-2">
              {welcomePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(prompt)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-all shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <button
                  key={i}
                  onClick={() => handleSearch(action.prompt)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${action.gradient} border border-white/50 hover:shadow-md transition-all text-left`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center mb-2 ${action.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{action.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{action.prompt}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about salons, services, prices..."
            className="w-full px-5 py-4 pr-14 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100 text-sm transition-all shadow-lg"
          />
          <button
            onClick={() => handleSearch(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center disabled:opacity-50 hover:shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-3">
          AI responses are generated based on live salon data. Every recommendation references real prices, ratings, and trust scores from our database.
        </p>
      </div>
    </div>
  )
}

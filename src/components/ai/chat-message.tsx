'use client'

import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RecommendationCard } from './recommendation-card'
import type { Salon } from '@/types'

interface ChatMessageProps {
  message: string
  role: 'user' | 'assistant'
  timestamp?: string
  recommendations?: Salon[]
  className?: string
}

export function ChatMessage({
  message,
  role,
  timestamp,
  recommendations,
  className,
}: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex w-full gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-gradient-to-br from-glowgo-pink to-glowgo-lavender'
            : 'bg-gray-100'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>

      <div className={cn('flex max-w-[80%] flex-col', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-glowgo-pink to-glowgo-lavender text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          )}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>

        {recommendations && recommendations.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {recommendations.map((salon) => (
              <RecommendationCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}

        {timestamp && (
          <span className="mt-1 px-1 text-[10px] text-gray-400">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}

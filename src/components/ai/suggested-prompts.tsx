'use client'

import { cn } from '@/lib/utils'

const defaultPrompts = [
  'Find me a good facial in Bandra',
  'Bridal makeup under ₹10000',
  'Best hair salons near me',
  'What services do you recommend for glowing skin?',
]

interface SuggestedPromptsProps {
  prompts?: string[]
  onSelect: (prompt: string) => void
  className?: string
}

export function SuggestedPrompts({
  prompts = defaultPrompts,
  onSelect,
  className,
}: SuggestedPromptsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-none', className)}>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="shrink-0 rounded-full border border-glowgo-pink/30 bg-glowgo-cream/50 px-4 py-1.5 text-xs text-gray-600 whitespace-nowrap transition-all hover:border-glowgo-pink hover:bg-glowgo-pink/10 hover:text-glowgo-pink"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}

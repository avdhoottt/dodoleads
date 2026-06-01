'use client'

import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/supabase'

const config: Record<Priority, { label: string; className: string }> = {
  hot: {
    label: 'Hot',
    className: 'bg-[#C6FE1E]/15 text-[#C6FE1E] border border-[#C6FE1E]/30',
  },
  warm: {
    label: 'Warm',
    className: 'bg-[#FF8B37]/15 text-[#FF8B37] border border-[#FF8B37]/30',
  },
  cold: {
    label: 'Cold',
    className: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide', className)}>
      {priority === 'hot' && <span className="mr-1">🔥</span>}
      {label}
    </span>
  )
}

'use client'

import { cn } from '@/lib/utils'
import type { Source } from '@/lib/supabase'

const config: Record<Source, { label: string; color: string }> = {
  product_hunt:    { label: 'Product Hunt',    color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  hacker_news:     { label: 'Hacker News',     color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  betalist:        { label: 'BetaList',        color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  devto:           { label: 'DEV.to',          color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  github_trending: { label: 'GitHub Trending', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  hn_launches:     { label: 'YC Launches',     color: 'text-[#FF8B37] bg-[#FF8B37]/10 border-[#FF8B37]/20' },
}

export function SourceBadge({ source }: { source: Source }) {
  const { label, color } = config[source] ?? { label: source, color: 'text-zinc-400 bg-zinc-800 border-zinc-700' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', color)}>
      {label}
    </span>
  )
}

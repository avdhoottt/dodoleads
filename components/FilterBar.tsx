'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Filters {
  source: string
  priority: string
  date: string
  search: string
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
}

const SOURCES = [
  { value: 'all',             label: 'All Sources' },
  { value: 'product_hunt',    label: 'Product Hunt' },
  { value: 'hacker_news',     label: 'Hacker News' },
  { value: 'betalist',        label: 'BetaList' },
  { value: 'devto',           label: 'DEV.to' },
  { value: 'github_trending', label: 'GitHub Trending' },
  { value: 'hn_launches',     label: 'YC Launches' },
]

const PRIORITIES = [
  { value: 'all', label: 'All Priority' },
  { value: 'hot', label: '🔥 Hot' },
  { value: 'warm', label: '🟠 Warm' },
  { value: 'cold', label: '🩶 Cold' },
]

const selectClass = 'bg-[#111111] border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C6FE1E]/50 focus:ring-1 focus:ring-[#C6FE1E]/20 appearance-none cursor-pointer hover:border-zinc-700 transition-colors'

export function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value })

  const hasActive = filters.source !== 'all' || filters.priority !== 'all' || filters.date || filters.search

  const reset = () => onChange({ source: 'all', priority: 'all', date: '', search: '' })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={set('search')}
          className="w-full bg-[#111111] border border-zinc-800 text-zinc-300 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#C6FE1E]/50 focus:ring-1 focus:ring-[#C6FE1E]/20 placeholder-zinc-600 hover:border-zinc-700 transition-colors"
        />
      </div>

      <select value={filters.source} onChange={set('source')} className={selectClass}>
        {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <select value={filters.priority} onChange={set('priority')} className={selectClass}>
        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      <input
        type="date"
        value={filters.date}
        onChange={set('date')}
        className={cn(selectClass, 'text-zinc-400')}
      />

      {hasActive && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 px-2 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}

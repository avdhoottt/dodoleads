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
  { value: 'all',             label: 'All' },
  { value: 'product_hunt',    label: 'Product Hunt' },
  { value: 'hacker_news',     label: 'Hacker News' },
  { value: 'betalist',        label: 'BetaList' },
  { value: 'devto',           label: 'DEV.to' },
  { value: 'github_trending', label: 'GitHub' },
  { value: 'hn_launches',     label: 'YC Launches' },
]

const PRIORITIES = [
  { value: 'all',  label: 'All',  dot: null },
  { value: 'hot',  label: 'Hot',  dot: '#C6FE1E' },
  { value: 'warm', label: 'Warm', dot: '#FF8B37' },
  { value: 'cold', label: 'Cold', dot: '#52525b' },
]

const selectClass = 'bg-[#111111] border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#C6FE1E]/50 focus:ring-1 focus:ring-[#C6FE1E]/20 appearance-none cursor-pointer hover:border-zinc-700 transition-colors'

export function FilterBar({ filters, onChange }: Props) {
  const set = (key: keyof Filters) => (val: string) =>
    onChange({ ...filters, [key]: val })

  const hasActive = filters.source !== 'all' || filters.priority !== 'all' || filters.date || filters.search

  const reset = () => onChange({ source: 'all', priority: 'all', date: '', search: '' })

  return (
    <div className="flex flex-col gap-2.5">
      {/* Row 1 — search + date + clear */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => set('search')(e.target.value)}
            className="w-full bg-[#111111] border border-zinc-800 text-zinc-300 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#C6FE1E]/50 focus:ring-1 focus:ring-[#C6FE1E]/20 placeholder-zinc-600 hover:border-zinc-700 transition-colors"
          />
        </div>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => set('date')(e.target.value)}
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

      {/* Row 2 — source pills + priority pills */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Source pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => set('source')(s.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                filters.source === s.value
                  ? 'bg-[#C6FE1E]/10 border-[#C6FE1E]/40 text-[#C6FE1E]'
                  : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              )}
             
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-zinc-800 hidden sm:block" />

        {/* Priority pills */}
        <div className="flex items-center gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => set('priority')(p.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
                filters.priority === p.value
                  ? 'bg-[#C6FE1E]/10 border-[#C6FE1E]/40 text-[#C6FE1E]'
                  : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              )}
             
            >
              {p.dot && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.dot }}
                />
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

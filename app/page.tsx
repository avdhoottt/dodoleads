'use client'

import { useState, useEffect, useCallback } from 'react'
import { LayoutGrid, List, History, ChevronDown } from 'lucide-react'
import { StatsBar } from '@/components/StatsBar'
import { FilterBar, type Filters } from '@/components/FilterBar'
import { LeadCard } from '@/components/LeadCard'
import { ScrapeButton } from '@/components/ScrapeButton'
import { ExportButton } from '@/components/ExportButton'
import { ScrapeHistory } from '@/components/ScrapeHistory'
import { cn } from '@/lib/utils'
import type { Lead, ScrapeRun } from '@/lib/supabase'

const DEFAULT_FILTERS: Filters = { source: 'all', priority: 'all', date: '', search: '' }

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [runs, setRuns] = useState<ScrapeRun[]>([])
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.source !== 'all') params.set('source', filters.source)
      if (filters.priority !== 'all') params.set('priority', filters.priority)
      if (filters.date) params.set('date', filters.date)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/leads?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      setLeads(data.leads ?? [])
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/scrape-runs')
      if (!res.ok) return
      const data = await res.json()
      setRuns(data.runs ?? [])
    } catch {
      // silently ignore — history panel just stays empty
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { fetchRuns() }, [fetchRuns])

  const handleContactedChange = (id: string, contacted: boolean) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, contacted } : l))
  }

  const handleScrapeSuccess = () => {
    fetchLeads()
    fetchRuns()
  }

  const lastRun = runs[0]

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-[#09090B]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#C6FE1E] flex items-center justify-center">
              <span className="text-black font-black text-xs">D</span>
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              Dodo <span className="text-[#C6FE1E]">Leads</span>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-all duration-200',
                showHistory
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform', showHistory && 'rotate-180')} />
            </button>
            <ExportButton filters={filters} />
            <ScrapeButton
              onSuccess={handleScrapeSuccess}
              lastRunAt={lastRun?.completed_at ?? null}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Scrape History Panel */}
        {showHistory && (
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">Recent Scrape Runs</h2>
            <ScrapeHistory runs={runs} />
          </div>
        )}

        {/* Stats */}
        <StatsBar leads={leads} />

        {/* Filters + View Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-[#111111] border border-zinc-800 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setView('grid')}
              className={cn('p-1.5 rounded-md transition-colors', view === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-1.5 rounded-md transition-colors', view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-zinc-500 text-sm">
            {loading ? 'Loading...' : `${leads.length} lead${leads.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Lead Grid / List */}
        {loading ? (
          <div className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'flex flex-col gap-2'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-zinc-800 rounded-xl h-40 animate-pulse"
              />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#C6FE1E]/10 border border-[#C6FE1E]/20 flex items-center justify-center">
              <span className="text-2xl">🦤</span>
            </div>
            <p className="text-zinc-400 font-medium">No leads found</p>
            <p className="text-zinc-600 text-sm text-center max-w-xs">
              Hit <span className="text-[#C6FE1E]">Refresh Leads</span> to scrape all sources, or adjust your filters.
            </p>
          </div>
        ) : (
          <div className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'flex flex-col gap-2'
          )}>
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onContactedChange={handleContactedChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

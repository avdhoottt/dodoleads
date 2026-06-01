'use client'

import { Download } from 'lucide-react'
import type { Filters } from './FilterBar'

interface Props {
  filters: Filters
}

export function ExportButton({ filters }: Props) {
  const download = () => {
    const params = new URLSearchParams()
    if (filters.source !== 'all') params.set('source', filters.source)
    if (filters.priority !== 'all') params.set('priority', filters.priority)
    if (filters.date) params.set('date', filters.date)
    if (filters.search) params.set('search', filters.search)

    const url = `/api/export?${params.toString()}`
    const a = document.createElement('a')
    a.href = url
    a.download = `dodo-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white transition-all duration-200"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  )
}

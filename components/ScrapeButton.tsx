'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSuccess: () => void
  lastRunAt?: string | null
}

export function ScrapeButton({ onSuccess, lastRunAt }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; total: number } | null>(null)

  const run = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setResult({ inserted: data.inserted, total: data.total })
        onSuccess()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {lastRunAt && (
        <span className="text-zinc-600 text-xs hidden sm:block">
          Last run: {new Date(lastRunAt).toLocaleString()}
        </span>
      )}
      {result && (
        <span className="text-[#C6FE1E] text-xs">
          +{result.inserted} new ({result.total} found)
        </span>
      )}
      <button
        onClick={run}
        disabled={loading}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
          loading
            ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
            : 'bg-[#C6FE1E]/10 border-[#C6FE1E]/30 text-[#C6FE1E] hover:bg-[#C6FE1E]/20 hover:border-[#C6FE1E]/50'
        )}
      >
        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        {loading ? 'Scraping...' : 'Refresh Leads'}
      </button>
    </div>
  )
}

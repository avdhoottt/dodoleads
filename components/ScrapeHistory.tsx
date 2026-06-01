'use client'

import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { ScrapeRun } from '@/lib/supabase'

interface Props {
  runs: ScrapeRun[]
}

export function ScrapeHistory({ runs }: Props) {
  if (runs.length === 0) {
    return (
      <p className="text-zinc-600 text-sm text-center py-4">No scrape runs yet. Hit Refresh Leads to start.</p>
    )
  }

  return (
    <div className="space-y-1.5">
      {runs.map((run) => (
        <div key={run.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-zinc-900/50 rounded-lg">
          <div className="flex items-center gap-2">
            {run.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#C6FE1E] flex-shrink-0" />}
            {run.status === 'failed' && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            {run.status === 'running' && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin flex-shrink-0" />}
            <span className={cn('text-xs font-medium', {
              'text-[#C6FE1E]': run.status === 'completed',
              'text-red-400': run.status === 'failed',
              'text-zinc-400': run.status === 'running',
            })}>
              {run.status === 'completed' && `+${run.new_leads} new / ${run.total_leads} found`}
              {run.status === 'failed' && 'Failed'}
              {run.status === 'running' && 'Running...'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-600 text-xs">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}

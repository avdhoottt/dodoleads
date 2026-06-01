'use client'

import { useState } from 'react'
import { ExternalLink, Check, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { PriorityBadge } from './PriorityBadge'
import { SourceBadge } from './SourceBadge'
import type { Lead } from '@/lib/supabase'

interface Props {
  lead: Lead
  onContactedChange: (id: string, contacted: boolean) => void
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2)
  return (
    <div className="w-10 h-10 rounded-lg bg-[#C6FE1E]/10 border border-[#C6FE1E]/20 flex items-center justify-center text-[#C6FE1E] font-bold text-sm flex-shrink-0">
      {letters.toUpperCase()}
    </div>
  )
}

export function LeadCard({ lead, onContactedChange }: Props) {
  const [loading, setLoading] = useState(false)

  const toggleContacted = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: !lead.contacted }),
      })
      if (res.ok) onContactedChange(lead.id, !lead.contacted)
    } finally {
      setLoading(false)
    }
  }

  const launchDate = (() => {
    try {
      return formatDistanceToNow(new Date(lead.launch_date), { addSuffix: true })
    } catch {
      return lead.launch_date
    }
  })()

  return (
    <div className={cn(
      'group relative bg-[#111111] border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:border-zinc-600',
      lead.contacted ? 'border-zinc-700/50 opacity-60' : 'border-zinc-800'
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {lead.logo_url ? (
          <img
            src={lead.logo_url}
            alt={lead.product_name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <Initials name={lead.product_name} />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-white text-sm leading-tight truncate">
              {lead.product_name}
            </h3>
            {lead.external_url && (
              <a
                href={lead.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-[#C6FE1E] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <SourceBadge source={lead.source} />
            <span className="text-zinc-600 text-xs">{launchDate}</span>
          </div>
        </div>

        <PriorityBadge priority={lead.priority} />
      </div>

      {/* Description */}
      {lead.description && (
        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
          {lead.description}
        </p>
      )}

      {/* Founder info */}
      <div className="border-t border-zinc-800/60 pt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {lead.founder_name ? (
            <span className="text-zinc-300 text-xs font-medium truncate">{lead.founder_name}</span>
          ) : (
            <span className="text-zinc-600 text-xs italic">Founder unknown</span>
          )}

          <div className="flex items-center gap-1.5">
            {lead.founder_twitter && (
              <a
                href={lead.founder_twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-sky-400 transition-colors text-xs font-bold"
                title="Twitter/X"
              >
                𝕏
              </a>
            )}
            {lead.founder_linkedin && (
              <a
                href={lead.founder_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-blue-400 transition-colors"
                title="LinkedIn"
              >
                <span className="text-xs font-bold">in</span>
              </a>
            )}
            <span className="text-zinc-600 text-[10px] flex items-center gap-1" title="Get verified email via Apollo">
              <Mail className="w-3 h-3" />
              Apollo
            </span>
          </div>
        </div>

        <button
          onClick={toggleContacted}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 border flex-shrink-0',
            lead.contacted
              ? 'bg-[#C6FE1E]/10 text-[#C6FE1E] border-[#C6FE1E]/30'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
          )}
        >
          {lead.contacted ? (
            <><Check className="w-3 h-3" /> Contacted</>
          ) : (
            'Mark Contacted'
          )}
        </button>
      </div>
    </div>
  )
}

'use client'

import { Flame, Users, CheckCircle, Globe } from 'lucide-react'
import type { Lead } from '@/lib/supabase'

interface Props {
  leads: Lead[]
}

export function StatsBar({ leads }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const todayLeads = leads.filter((l) => l.launch_date === today || l.created_at.startsWith(today))
  const hotCount = leads.filter((l) => l.priority === 'hot').length
  const contactedCount = leads.filter((l) => l.contacted).length
  const sourcesActive = new Set(leads.map((l) => l.source)).size

  const stats = [
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Total Leads',
      value: leads.length,
      sub: `${todayLeads.length} today`,
      color: 'text-zinc-300',
      iconColor: 'text-zinc-400',
    },
    {
      icon: <Flame className="w-4 h-4" />,
      label: 'Hot Leads',
      value: hotCount,
      sub: `${leads.length > 0 ? Math.round((hotCount / leads.length) * 100) : 0}% of total`,
      color: 'text-[#C6FE1E]',
      iconColor: 'text-[#C6FE1E]',
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Contacted',
      value: contactedCount,
      sub: `${leads.length - contactedCount} remaining`,
      color: 'text-zinc-300',
      iconColor: 'text-emerald-400',
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: 'Sources Active',
      value: sourcesActive,
      sub: 'of 6 sources',
      color: 'text-zinc-300',
      iconColor: 'text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#111111] border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <div className={`${stat.iconColor} flex-shrink-0`}>{stat.icon}</div>
          <div>
            <div className={`text-xl font-bold leading-none ${stat.color}`}>{stat.value}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
            <div className="text-zinc-600 text-[10px]">{stat.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

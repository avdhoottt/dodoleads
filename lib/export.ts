import type { Lead } from './supabase'

const SOURCE_LABELS: Record<string, string> = {
  product_hunt: 'Product Hunt',
  hacker_news: 'Hacker News',
  uneed: 'Uneed',
  betalist: 'BetaList',
  theresanaiforthat: "There's An AI For That",
  futurepedia: 'Futurepedia',
}

export function leadsToCSV(leads: Lead[]): string {
  const headers = [
    'Product Name',
    'Description',
    'Source',
    'Launch Date',
    'Priority',
    'Founder Name',
    'Twitter',
    'LinkedIn',
    'External URL',
    'Contacted',
  ]

  const rows = leads.map((lead) => [
    lead.product_name,
    lead.description ?? '',
    SOURCE_LABELS[lead.source] ?? lead.source,
    lead.launch_date,
    lead.priority,
    lead.founder_name ?? '',
    lead.founder_twitter ?? '',
    lead.founder_linkedin ?? '',
    lead.external_url ?? '',
    lead.contacted ? 'Yes' : 'No',
  ])

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
}

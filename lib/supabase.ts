import { createClient } from '@supabase/supabase-js'

export type Priority = 'hot' | 'warm' | 'cold'
export type Source = 'product_hunt' | 'hacker_news' | 'betalist' | 'devto' | 'github_trending' | 'hn_launches'
export type ScrapeStatus = 'running' | 'completed' | 'failed'

export interface Lead {
  id: string
  product_name: string
  logo_url: string | null
  description: string | null
  source: Source
  external_url: string | null
  launch_date: string
  priority: Priority
  founder_name: string | null
  founder_twitter: string | null
  founder_linkedin: string | null
  contacted: boolean
  created_at: string
  updated_at: string
}

export interface ScrapeRun {
  id: string
  started_at: string
  completed_at: string | null
  status: ScrapeStatus
  total_leads: number
  new_leads: number
  error_message: string | null
}

// Client-side client (anon key) — lazy singleton
let _supabase: ReturnType<typeof createClient> | null = null
export function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// Server-side client (service role — only used in API routes)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

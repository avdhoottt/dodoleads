export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServiceClient()
  const { searchParams } = new URL(req.url)

  const source = searchParams.get('source')
  const priority = searchParams.get('priority')
  const date = searchParams.get('date')
  const search = searchParams.get('search')
  const contacted = searchParams.get('contacted')

  let query = db
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (source && source !== 'all') query = query.eq('source', source)
  if (priority && priority !== 'all') query = query.eq('priority', priority)
  if (date) query = query.eq('launch_date', date)
  if (contacted === 'true') query = query.eq('contacted', true)
  if (search) query = query.ilike('product_name', `%${search}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ leads: data ?? [] })
}

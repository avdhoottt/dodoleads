export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { leadsToCSV } from '@/lib/export'

export async function GET(req: NextRequest) {
  const db = createServiceClient()
  const { searchParams } = new URL(req.url)

  const source = searchParams.get('source')
  const priority = searchParams.get('priority')
  const date = searchParams.get('date')
  const search = searchParams.get('search')

  let query = db
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (source && source !== 'all') query = query.eq('source', source)
  if (priority && priority !== 'all') query = query.eq('priority', priority)
  if (date) query = query.eq('launch_date', date)
  if (search) query = query.ilike('product_name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const csv = leadsToCSV(data ?? [])
  const filename = `dodo-leads-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

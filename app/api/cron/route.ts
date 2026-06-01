import { NextRequest, NextResponse } from 'next/server'
import { runAllScrapers } from '@/lib/scrapers'

export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runAllScrapers()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[/api/cron]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

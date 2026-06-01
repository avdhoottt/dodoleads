import { NextResponse } from 'next/server'
import { runAllScrapers } from '@/lib/scrapers'

export const maxDuration = 60

export async function POST() {
  try {
    const result = await runAllScrapers()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('[/api/scrape]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

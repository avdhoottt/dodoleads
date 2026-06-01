import { createServiceClient } from '../supabase'
import { scrapeProductHunt } from './producthunt'
import { scrapeHackerNews } from './hackernews'
import { scrapeBetaList } from './betalist'
import { scrapeDevTo } from './devto'
import { scrapeGitHubTrending } from './github_trending'
import { scrapeHNLaunches } from './hn_launches'
import type { ScrapedLead } from './producthunt'

export async function runAllScrapers(): Promise<{ total: number; inserted: number; runId: string }> {
  const db = createServiceClient()

  const { data: run, error: runErr } = await db
    .from('scrape_runs')
    .insert({ status: 'running' })
    .select()
    .single()

  if (runErr || !run) {
    throw new Error('Failed to create scrape run: ' + runErr?.message)
  }

  try {
    const results = await Promise.allSettled([
      scrapeProductHunt(),
      scrapeHackerNews(),
      scrapeBetaList(),
      scrapeDevTo(),
      scrapeGitHubTrending(),
      scrapeHNLaunches(),
    ])

    const allLeads: ScrapedLead[] = results.flatMap((r) =>
      r.status === 'fulfilled' ? r.value : []
    )

    let inserted = 0
    if (allLeads.length > 0) {
      // Fetch existing (product_name, source) pairs to deduplicate in code
      // avoids needing a specific unique constraint shape for ON CONFLICT
      const { data: existing } = await db
        .from('leads')
        .select('product_name, source')

      const existingSet = new Set(
        (existing ?? []).map((r) => `${r.source}::${r.product_name.toLowerCase()}`)
      )

      const newLeads = allLeads.filter(
        (l) => !existingSet.has(`${l.source}::${l.product_name.toLowerCase()}`)
      )

      if (newLeads.length > 0) {
        const { data, error } = await db
          .from('leads')
          .insert(newLeads)
          .select('id')

        if (error) throw new Error('Insert failed: ' + error.message)
        inserted = data?.length ?? 0
      }
    }

    await db
      .from('scrape_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_leads: allLeads.length,
        new_leads: inserted,
      })
      .eq('id', run.id)

    return { total: allLeads.length, inserted, runId: run.id }
  } catch (err) {
    await db
      .from('scrape_runs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: String(err),
      })
      .eq('id', run.id)

    throw err
  }
}

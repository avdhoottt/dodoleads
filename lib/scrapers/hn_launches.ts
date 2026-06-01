import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

export async function scrapeHNLaunches(): Promise<ScrapedLead[]> {
  try {
    // "Launch HN:" posts = YC company launches (Ask HN tag)
    // These are extremely high-value leads — funded, early-stage, often SaaS
    const yesterday = Math.floor((Date.now() - 86400000 * 7) / 1000) // last 7 days
    const url = `https://hn.algolia.com/api/v1/search?query=Launch+HN&tags=ask_hn&numericFilters=created_at_i>${yesterday}&hitsPerPage=30`
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HN Algolia ${res.status}`)
    const data = await res.json()
    const hits = (data?.hits ?? []).filter((h: any) =>
      h.title?.toLowerCase().startsWith('launch hn:')
    )

    return hits.map((hit: any): ScrapedLead => {
      const rawTitle: string = hit.title ?? ''
      // "Launch HN: ProductName (YC W25) – description"
      const withoutPrefix = rawTitle.replace(/^launch hn:\s*/i, '')
      const name = withoutPrefix.split(/[–—-]/)[0].replace(/\(YC [SW]\d+\)/i, '').trim()
      const desc = withoutPrefix.split(/[–—]/).slice(1).join(' ').trim() || withoutPrefix

      return {
        product_name: name,
        logo_url: null,
        description: desc || null,
        source: 'hn_launches',
        external_url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        launch_date: hit.created_at?.split('T')[0] ?? today(),
        priority: classifyPriority(desc),
        founder_name: hit.author ?? null,
        founder_twitter: null,
        founder_linkedin: null,
      }
    })
  } catch (err) {
    console.error('[HN Launches scraper]', err)
    return []
  }
}

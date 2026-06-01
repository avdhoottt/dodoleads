import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

export async function scrapeHackerNews(): Promise<ScrapedLead[]> {
  try {
    // Algolia HN search — Show HN posts from last 24h
    const yesterday = Math.floor((Date.now() - 86400000) / 1000)
    const url = `https://hn.algolia.com/api/v1/search?tags=show_hn&numericFilters=created_at_i>${yesterday}&hitsPerPage=50`

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HN API ${res.status}`)
    const data = await res.json()
    const hits = data?.hits ?? []

    return hits.map((hit: any): ScrapedLead => {
      const title: string = hit.title ?? ''
      // Strip "Show HN: " prefix
      const name = title.replace(/^show hn:\s*/i, '').split(' – ')[0].split(' - ')[0].trim()
      const description = title.replace(/^show hn:\s*/i, '').trim()

      return {
        product_name: name,
        logo_url: null,
        description,
        source: 'hacker_news',
        external_url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
        launch_date: today(),
        priority: classifyPriority(description),
        founder_name: hit.author ?? null,
        founder_twitter: null,
        founder_linkedin: null,
      }
    })
  } catch (err) {
    console.error('[HackerNews scraper]', err)
    return []
  }
}

import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

export async function scrapeDevTo(): Promise<ScrapedLead[]> {
  try {
    // DEV.to public REST API — no auth needed
    // showdev tag = "I built this" posts from indie developers
    const url = 'https://dev.to/api/articles?tag=showdev&per_page=30&top=1'
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DodoLeadsBot/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`DEV.to API ${res.status}`)
    const articles = await res.json()

    return articles.map((a: any): ScrapedLead => {
      const twitterHandle = a.user?.twitter_username
      return {
        product_name: a.title?.replace(/^i built\s*/i, '').replace(/^show dev:\s*/i, '').trim() || a.title,
        logo_url: a.social_image ?? a.user?.profile_image ?? null,
        description: a.description ?? null,
        source: 'devto',
        external_url: a.url ?? null,
        launch_date: a.published_at?.split('T')[0] ?? today(),
        priority: classifyPriority(`${a.title} ${a.description ?? ''}`),
        founder_name: a.user?.name ?? null,
        founder_twitter: twitterHandle ? `https://twitter.com/${twitterHandle}` : null,
        founder_linkedin: null,
      }
    })
  } catch (err) {
    console.error('[DEV.to scraper]', err)
    return []
  }
}

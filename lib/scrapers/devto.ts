import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

// Fetch multiple tags and merge, deduplicating by article id
async function fetchTag(tag: string): Promise<any[]> {
  const res = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=30&top=1`, {
    headers: { 'User-Agent': 'DodoLeadsBot/1.0' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  return res.json()
}

// Skip pure tutorial / how-to articles — not product launches
const SKIP_PATTERNS = [/^how to /i, /^tutorial:/i, /^guide:/i, /^learn /i, /^understanding /i, /^introduction to/i]

export async function scrapeDevTo(): Promise<ScrapedLead[]> {
  try {
    const [showdev, startup, webdev] = await Promise.all([
      fetchTag('showdev'),
      fetchTag('startup'),
      fetchTag('webdev'),
    ])

    // Deduplicate by article id across all three tags
    const seen = new Set<number>()
    const articles = [...showdev, ...startup, ...webdev].filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })

    return articles
      .filter((a) => !SKIP_PATTERNS.some((p) => p.test(a.title ?? '')))
      .map((a: any): ScrapedLead => ({
        product_name: a.title
          ?.replace(/^i built\s*/i, '')
          .replace(/^show dev:\s*/i, '')
          .replace(/^launch:\s*/i, '')
          .trim() || a.title,
        logo_url: a.social_image ?? a.user?.profile_image ?? null,
        description: a.description ?? null,
        source: 'devto',
        external_url: a.url ?? null,
        launch_date: a.published_at?.split('T')[0] ?? today(),
        priority: classifyPriority(`${a.title} ${a.description ?? ''}`),
        founder_name: a.user?.name ?? null,
        founder_twitter: a.user?.twitter_username
          ? `https://twitter.com/${a.user.twitter_username}`
          : null,
        founder_linkedin: null,
      }))
  } catch (err) {
    console.error('[DEV.to scraper]', err)
    return []
  }
}

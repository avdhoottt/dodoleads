import * as cheerio from 'cheerio'
import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

export async function scrapeBetaList(): Promise<ScrapedLead[]> {
  try {
    // Root URL is the listing page — /startups returns 404
    const res = await fetch('https://betalist.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`BetaList HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const leads: ScrapedLead[] = []

    // BetaList uses /startups/slug links on the homepage
    $('a[href^="/startups/"]').each((_, el) => {
      const $el = $(el)
      const href = $el.attr('href') ?? ''
      if (!href || href === '/startups') return

      // Product name from heading inside the link, or derive from slug
      const name = $el.find('h2, h3, strong, [class*="name"], [class*="title"]').first().text().trim()
        || href.split('/').pop()?.replace(/-/g, ' ') || ''
      const desc = $el.find('p, [class*="desc"], [class*="tagline"], span').first().text().trim()
      const logo = $el.find('img').first().attr('src') ?? null
      const url = `https://betalist.com${href}`

      if (!name) return
      leads.push({
        product_name: name,
        logo_url: logo,
        description: desc || null,
        source: 'betalist',
        external_url: url,
        launch_date: today(),
        priority: classifyPriority(desc),
        founder_name: null,
        founder_twitter: null,
        founder_linkedin: null,
      })
    })

    const seen = new Set<string>()
    return leads.filter((l) => {
      if (seen.has(l.product_name)) return false
      seen.add(l.product_name)
      return true
    }).slice(0, 30)
  } catch (err) {
    console.error('[BetaList scraper]', err)
    return []
  }
}

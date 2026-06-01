import * as cheerio from 'cheerio'
import { classifyPriority } from '../classify'
import type { ScrapedLead } from './producthunt'

const today = () => new Date().toISOString().split('T')[0]

// Things that are clearly not products / founders to reach out to
const SKIP_KEYWORDS = ['awesome list', 'awesome-', 'cheat sheet', 'cheatsheet', 'interview prep',
  'roadmap', 'learning', 'tutorial', 'course', 'leetcode', 'algorithm', 'data structure']

export async function scrapeGitHubTrending(): Promise<ScrapedLead[]> {
  try {
    const res = await fetch('https://github.com/trending?since=daily', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`GitHub trending HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)
    const leads: ScrapedLead[] = []

    $('article.Box-row').each((_, el) => {
      const $el = $(el)
      const repoLink = $el.find('h2 a').first()
      const fullName = repoLink.attr('href')?.replace(/^\//, '') ?? ''
      const [owner, repo] = fullName.split('/')
      if (!repo) return

      const name = repo.replace(/-/g, ' ')
      const desc = $el.find('p').first().text().trim()
      const combined = `${name} ${desc}`.toLowerCase()

      // Skip curated lists, tutorials, study materials — not real products
      if (SKIP_KEYWORDS.some((kw) => combined.includes(kw))) return

      leads.push({
        product_name: fullName,
        logo_url: `https://github.com/${owner}.png?size=64`,
        description: desc || null,
        source: 'github_trending',
        external_url: `https://github.com/${fullName}`,
        launch_date: today(),
        priority: classifyPriority(`${name} ${desc}`),
        founder_name: owner,
        founder_twitter: null,
        founder_linkedin: null,
      })
    })

    return leads.slice(0, 25)
  } catch (err) {
    console.error('[GitHub Trending scraper]', err)
    return []
  }
}

import { classifyPriority } from '../classify'
import type { Source } from '../supabase'

export interface ScrapedLead {
  product_name: string
  logo_url: string | null
  description: string | null
  source: Source
  external_url: string | null
  launch_date: string
  priority: 'hot' | 'warm' | 'cold'
  founder_name: string | null
  founder_twitter: string | null
  founder_linkedin: string | null
}

const today = () => new Date().toISOString().split('T')[0]

export async function scrapeProductHunt(): Promise<ScrapedLead[]> {
  const token = process.env.PRODUCT_HUNT_TOKEN
  const query = `
    query {
      posts(order: NEWEST, first: 30, postedAfter: "${new Date(Date.now() - 86400000).toISOString()}") {
        edges {
          node {
            name
            tagline
            url
            thumbnail { url }
            user {
              name
              twitterUsername
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) throw new Error(`PH API ${res.status}`)
    const data = await res.json()
    const edges = data?.data?.posts?.edges ?? []

    return edges.map(({ node }: any): ScrapedLead => ({
      product_name: node.name,
      logo_url: node.thumbnail?.url ?? null,
      description: node.tagline ?? null,
      source: 'product_hunt',
      external_url: node.url ?? null,
      launch_date: today(),
      priority: classifyPriority(node.tagline ?? ''),
      founder_name: node.user?.name ?? null,
      founder_twitter: node.user?.twitterUsername
        ? `https://twitter.com/${node.user.twitterUsername}`
        : null,
      founder_linkedin: null,
    }))
  } catch (err) {
    console.error('[ProductHunt scraper]', err)
    return []
  }
}

const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

// Find the right BetaList URL and structure
const paths = ['/', '/startups', '/newest', '/launched', '/new']
for (const path of paths) {
  const res = await fetch(`https://betalist.com${path}`, { headers: H, signal: AbortSignal.timeout(8000) })
  const html = await res.text()
  // Look for startup/product links
  const startupLinks = [...html.matchAll(/href="(\/startups?\/[^"]+)"/g)].map(m => m[1]).slice(0,5)
  const productLinks = [...html.matchAll(/href="(\/[a-z-]+\/[a-z0-9-]+)"/g)].map(m => m[1]).slice(0,5)
  console.log(`${path}: ${res.status} — startup links: ${startupLinks.join(', ') || 'none'}, sample links: ${productLinks.join(', ') || 'none'}`)
}

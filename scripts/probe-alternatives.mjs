const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

async function probe(name, url) {
  try {
    const res = await fetch(url, { headers: H, signal: AbortSignal.timeout(12000) })
    const text = await res.text()
    const blocked = text.includes('challenge-platform') || text.includes('__cf_chl') || text.includes('cf-browser-verification')
    console.log(`${name}: HTTP ${res.status}, ${text.length} chars ${blocked ? '🚫 CF-blocked' : ''}`)
    if (!blocked && res.ok) {
      if (text.includes('<rss') || text.includes('<feed') || text.includes('<item>')) {
        const titles = [...text.matchAll(/<title[^>]*><!\[CDATA\[([^\]]+)\]\]><\/title>|<title[^>]*>([^<]{3,60})<\/title>/g)]
          .slice(1,4).map(m => (m[1]||m[2]).trim())
        console.log(`  ✅ VALID FEED — sample:`, titles)
      } else {
        console.log(`  → Preview: ${text.slice(0,200).replace(/\s+/g,' ')}`)
      }
    }
  } catch(e) { console.log(`${name}: ERROR — ${e.cause?.code ?? e.message}`) }
}

// BetaList retry
await probe('BetaList HTML retry', 'https://betalist.com/startups')
await probe('BetaList feed.xml', 'https://betalist.com/feed.xml')

// Alternative AI/SaaS launch sources
await probe('DevHunt (open source alt)', 'https://devhunt.org/')
await probe('Toolify.ai RSS', 'https://www.toolify.ai/feed')
await probe('Toolify.ai', 'https://www.toolify.ai/newest-ai-tools')
await probe('AITopTools RSS', 'https://aitoptools.com/feed/')
await probe('Indie Hackers Products RSS', 'https://www.indiehackers.com/products.rss')
await probe('Lobste.rs (show/tell)', 'https://lobste.rs/t/show.rss')

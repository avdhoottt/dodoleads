const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

async function probe(name, url) {
  try {
    const res = await fetch(url, { headers: H, signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    console.log(`${name}: HTTP ${res.status} (${text.length} chars)`)
    if (text.includes('<rss') || text.includes('<feed') || text.includes('<item>') || text.includes('<entry>')) {
      console.log(`  → VALID FEED ✅`)
      // grab first 3 titles
      const titles = [...text.matchAll(/<title[^>]*>([^<]{3,80})<\/title>/g)].slice(1, 4).map(m => m[1])
      titles.forEach(t => console.log(`     • ${t}`))
    } else {
      console.log(`  → Not a feed. Preview: ${text.slice(0,100).replace(/\s+/g,' ')}`)
    }
  } catch (e) {
    console.log(`${name}: FAILED — ${e.cause?.code ?? e.message}`)
  }
}

// Try RSS/Atom feeds for blocked sources
await probe('BetaList RSS', 'https://betalist.com/rss')
await probe('TAAFT RSS', 'https://theresanaiforthat.com/rss/')
await probe('TAAFT sitemap', 'https://theresanaiforthat.com/sitemap.xml')
await probe('Futurepedia RSS', 'https://www.futurepedia.io/rss')
await probe('Futurepedia feed', 'https://www.futurepedia.io/feed')
await probe('Uneed RSS', 'https://www.uneed.best/rss')
await probe('Uneed sitemap', 'https://www.uneed.best/sitemap.xml')

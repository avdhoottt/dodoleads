// Check Uneed sitemap structure + test BetaList alternative
const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

// Uneed sitemap
const res = await fetch('https://www.uneed.best/sitemap.xml', { headers: H })
const xml = await res.text()

// Extract tool URLs
const toolUrls = [...xml.matchAll(/<loc>(https:\/\/www\.uneed\.best\/tool\/[^<]+)<\/loc>/g)].map(m => m[1])
const total = [...xml.matchAll(/<loc>/g)].length
console.log(`Uneed sitemap: ${total} total URLs, ${toolUrls.length} /tool/ URLs`)
if (toolUrls.length > 0) console.log('Sample tool URLs:', toolUrls.slice(0, 5))

// Try fetching a single tool page from Uneed
if (toolUrls.length > 0) {
  const sample = toolUrls[0]
  try {
    const r = await fetch(sample, { headers: H, signal: AbortSignal.timeout(8000) })
    const html = await r.text()
    console.log(`\nUneed tool page (${sample}): HTTP ${r.status}, ${html.length} chars`)
    if (html.includes('challenge-platform') || html.includes('__cf_chl')) {
      console.log('  → Cloudflare block on tool pages too')
    } else {
      // Try to find title / description
      const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] ?? html.match(/<title>([^<]+)<\/title>/)?.[1]
      console.log(`  → Title: ${title}`)
      console.log(`  → First 300: ${html.slice(0,300).replace(/\s+/g,' ')}`)
    }
  } catch(e) { console.log('Tool page fetch failed:', e.message) }
}

// BetaList — check if DNS resolves at all
const { Resolver } = await import('dns').then(m => m.promises ? m : import('node:dns/promises'))
try {
  const addrs = await Resolver.prototype ? new Resolver().resolve4('betalist.com') : (await import('node:dns/promises')).resolve4('betalist.com')
  console.log('\nBetaList DNS resolved:', addrs)
} catch(e) {
  console.log('\nBetaList DNS FAILED:', e.message)
}

const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

async function probe(name, url) {
  try {
    const res = await fetch(url, { headers: H, signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    console.log(`\n${name}: HTTP ${res.status}, body: ${text.length} chars`)
    if (text.includes('cf-browser-verification') || text.includes('challenge-platform') || text.includes('__cf_chl')) {
      console.log(`  → Cloudflare bot challenge`)
    } else if (res.status === 403 || res.status === 429) {
      console.log(`  → Blocked (${res.status})`)
    } else {
      const preview = text.slice(0, 200).replace(/\s+/g, ' ')
      console.log(`  → Preview: ${preview}`)
    }
  } catch (e) {
    const code = e.cause?.code ?? e.message
    console.log(`\n${name}: FAILED — ${code}`)
  }
}

await probe('BetaList', 'https://betalist.com/startups')
await probe('TAAFT', 'https://theresanaiforthat.com/')
await probe('Futurepedia', 'https://www.futurepedia.io/')
await probe('Uneed', 'https://www.uneed.best/')
await probe('PH GraphQL (no token)', 'https://api.producthunt.com/v2/api/graphql')

const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

async function probe(name, url) {
  try {
    const res = await fetch(url, { headers: H, signal: AbortSignal.timeout(10000) })
    const text = await res.text()
    const blocked = text.includes('challenge-platform') || text.includes('__cf_chl')
    console.log(`${name}: HTTP ${res.status}, ${text.length} chars ${blocked ? '🚫 CF' : ''}`)
    if (!blocked && res.ok) console.log(`  Preview: ${text.slice(0,300).replace(/\s+/g,' ')}`)
  } catch(e) { console.log(`${name}: FAIL — ${e.cause?.code ?? e.message}`) }
}

// DEV.to public API (no auth)
const devRes = await fetch('https://dev.to/api/articles?tag=showdev&per_page=5&top=1', { headers: H })
const devData = await devRes.json()
console.log(`DEV.to showdev API: HTTP ${devRes.status}, ${devData.length} articles`)
devData.slice(0,3).forEach(a => console.log(`  • ${a.title} by ${a.user?.name}`))

// GitHub trending (HTML, might work)
await probe('GitHub trending AI', 'https://github.com/trending?since=daily&spoken_language_code=en')

// BetaList root
await probe('BetaList root', 'https://betalist.com/')

// Microlaunch (PH alternative)
await probe('MicroLaunch', 'https://microlaunch.net/')
await probe('MicroLaunch feed', 'https://microlaunch.net/feed')

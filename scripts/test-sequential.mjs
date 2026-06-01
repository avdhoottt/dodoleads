const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

async function run() {
  console.log('\n🦤 Dodo Leads — Sequential Source Test\n' + '─'.repeat(50))

  // 1. Product Hunt
  const phToken = process.env.PRODUCT_HUNT_TOKEN
  if (!phToken) {
    console.log('\n📡 Product Hunt: ⚠️  No PRODUCT_HUNT_TOKEN set')
  } else {
    try {
      const r = await fetch('https://api.producthunt.com/v2/api/graphql', {
        method: 'POST', signal: AbortSignal.timeout(10000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${phToken}` },
        body: JSON.stringify({ query: '{ posts(order:NEWEST,first:3){edges{node{name tagline user{name twitterUsername}}}}}'  }),
      })
      const d = await r.json()
      const items = d?.data?.posts?.edges ?? []
      if (d.errors) throw new Error(d.errors[0]?.message)
      console.log(`\n📡 Product Hunt: ✅ OK — ${items.length} leads`)
      items.forEach(({node:n}) => console.log(`   • ${n.name} | Founder: ${n.user?.name ?? '—'} | Twitter: ${n.user?.twitterUsername ? '@'+n.user.twitterUsername : '—'}`))
    } catch(e) { console.log(`\n📡 Product Hunt: ❌ ${e.message}`) }
  }

  // 2. Hacker News
  try {
    const since = Math.floor((Date.now()-86400000)/1000)
    const r = await fetch(`https://hn.algolia.com/api/v1/search?tags=show_hn&numericFilters=created_at_i>${since}&hitsPerPage=3`, { signal: AbortSignal.timeout(10000) })
    const d = await r.json()
    console.log(`\n📡 Hacker News: ✅ OK — ${d.nbHits} leads in last 24h`)
    d.hits?.slice(0,3).forEach(h => console.log(`   • ${h.title?.slice(0,70)} | by: ${h.author}`))
  } catch(e) { console.log(`\n📡 Hacker News: ❌ ${e.message}`) }

  // 3. BetaList
  try {
    const { load } = await import('cheerio')
    const r = await fetch('https://betalist.com/', { headers: H, signal: AbortSignal.timeout(10000) })
    const $ = load(await r.text())
    const names = []
    $('a[href^="/startups/"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && href !== '/startups') {
        const n = $(el).find('h2,h3,strong').first().text().trim() || href.split('/').pop()?.replace(/-/g,' ')
        if (n && !names.includes(n)) names.push(n)
      }
    })
    console.log(`\n📡 BetaList: ✅ OK — ${names.length} products found`)
    names.slice(0,3).forEach(n => console.log(`   • ${n}`))
  } catch(e) { console.log(`\n📡 BetaList: ❌ ${e.message}`) }

  // 4. DEV.to
  try {
    const r = await fetch('https://dev.to/api/articles?tag=showdev&per_page=3&top=1', { headers: H, signal: AbortSignal.timeout(10000) })
    const d = await r.json()
    console.log(`\n📡 DEV.to: ✅ OK — ${d.length} articles`)
    d.slice(0,3).forEach(a => console.log(`   • ${a.title?.slice(0,60)} | by: ${a.user?.name}${a.user?.twitter_username ? ' (@'+a.user.twitter_username+')' : ''}`))
  } catch(e) { console.log(`\n📡 DEV.to: ❌ ${e.message}`) }

  // 5. GitHub Trending
  try {
    const { load } = await import('cheerio')
    const r = await fetch('https://github.com/trending?since=daily', { headers: H, signal: AbortSignal.timeout(10000) })
    const $ = load(await r.text())
    const repos = []
    $('article.Box-row').each((_, el) => {
      const name = $(el).find('h2 a').attr('href')?.replace(/^\//,'')
      const desc = $(el).find('p').first().text().trim()
      if (name) repos.push({ name, desc })
    })
    console.log(`\n📡 GitHub Trending: ✅ OK — ${repos.length} repos total`)
    repos.slice(0,3).forEach(r => console.log(`   • ${r.name} | ${r.desc?.slice(0,50)}`))
  } catch(e) { console.log(`\n📡 GitHub Trending: ❌ ${e.message}`) }

  // 6. HN Launches (YC)
  try {
    const since = Math.floor((Date.now()-86400000*7)/1000)
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=Launch+HN&tags=ask_hn&numericFilters=created_at_i>${since}&hitsPerPage=5`, { signal: AbortSignal.timeout(10000) })
    const d = await r.json()
    const launches = (d?.hits ?? []).filter(h => h.title?.toLowerCase().startsWith('launch hn:'))
    console.log(`\n📡 YC Launches (HN): ✅ OK — ${launches.length} launches in last 7 days`)
    launches.slice(0,3).forEach(h => console.log(`   • ${h.title} | by: ${h.author}`))
  } catch(e) { console.log(`\n📡 YC Launches (HN): ❌ ${e.message}`) }

  console.log('\n' + '─'.repeat(50) + '\n')
}

run().catch(console.error)

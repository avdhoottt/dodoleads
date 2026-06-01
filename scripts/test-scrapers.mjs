// Updated scraper test — all 6 sources
const H = { 'User-Agent': 'Mozilla/5.0 (compatible; DodoLeadsBot/1.0)' }

const HOT = ['stripe','paddle','lemonsqueezy','gumroad','billing','payments','payment','subscription','monetize','credits','usage-based','saas','api','revenue','checkout']
const WARM = ['launch','users','waitlist','beta','growth','startup','tool','platform','software','app','dashboard','workflow','automation']
function classify(t = '') {
  const l = t.toLowerCase()
  if (HOT.some(k => l.includes(k))) return '🔥 HOT'
  if (WARM.some(k => l.includes(k))) return '🟠 WARM'
  return '🩶 COLD'
}

async function testProductHunt() {
  const token = process.env.PRODUCT_HUNT_TOKEN
  if (!token) return { source: 'Product Hunt', status: '⚠️  SKIP — No PRODUCT_HUNT_TOKEN', leads: [] }
  const q = `{ posts(order:NEWEST,first:5) { edges { node { name tagline url user { name twitterUsername } } } } }`
  const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: q }),
  })
  if (!res.ok) return { source: 'Product Hunt', status: `❌ HTTP ${res.status}`, leads: [] }
  const data = await res.json()
  if (data.errors) return { source: 'Product Hunt', status: `❌ ${data.errors[0]?.message}`, leads: [] }
  const leads = (data?.data?.posts?.edges ?? []).map(({ node }) => ({
    name: node.name, desc: node.tagline, founder: node.user?.name, twitter: node.user?.twitterUsername ? `@${node.user.twitterUsername}` : null, priority: classify(node.tagline)
  }))
  return { source: 'Product Hunt', status: `✅ OK`, count: leads.length, leads }
}

async function testHN() {
  const res = await fetch(`https://hn.algolia.com/api/v1/search?tags=show_hn&numericFilters=created_at_i>${Math.floor((Date.now()-86400000)/1000)}&hitsPerPage=5`)
  if (!res.ok) return { source: 'Hacker News', status: `❌ HTTP ${res.status}`, leads: [] }
  const data = await res.json()
  const leads = (data?.hits ?? []).map(h => ({ name: h.title?.replace(/^show hn:\s*/i,'').split(' – ')[0].trim(), founder: h.author, priority: classify(h.title) }))
  return { source: 'Hacker News', status: `✅ OK`, count: data.nbHits, leads }
}

async function testBetaList() {
  const { load } = await import('cheerio')
  const res = await fetch('https://betalist.com/', { headers: H })
  if (!res.ok) return { source: 'BetaList', status: `❌ HTTP ${res.status}`, leads: [] }
  const $ = load(await res.text())
  const leads = []
  $('a[href^="/startups/"]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href === '/startups') return
    const name = $(el).find('h2,h3,strong').first().text().trim() || href.split('/').pop()?.replace(/-/g,' ')
    const desc = $(el).find('p,span').first().text().trim()
    if (name) leads.push({ name, desc: desc?.slice(0,60), priority: classify(desc) })
  })
  const uniq = [...new Map(leads.map(l=>[l.name,l])).values()]
  return { source: 'BetaList', status: `✅ OK`, count: uniq.length, leads: uniq.slice(0,3) }
}

async function testDevTo() {
  const res = await fetch('https://dev.to/api/articles?tag=showdev&per_page=5&top=1', { headers: H })
  if (!res.ok) return { source: 'DEV.to', status: `❌ HTTP ${res.status}`, leads: [] }
  const data = await res.json()
  const leads = data.map(a => ({ name: a.title?.slice(0,50), founder: a.user?.name, twitter: a.user?.twitter_username ? `@${a.user.twitter_username}` : null, priority: classify(`${a.title} ${a.description}`) }))
  return { source: 'DEV.to', status: `✅ OK`, count: data.length, leads }
}

async function testGitHub() {
  const { load } = await import('cheerio')
  const res = await fetch('https://github.com/trending?since=daily', { headers: H })
  if (!res.ok) return { source: 'GitHub Trending', status: `❌ HTTP ${res.status}`, leads: [] }
  const $ = load(await res.text())
  const leads = []
  $('article.Box-row').each((_, el) => {
    const name = $(el).find('h2 a').attr('href')?.replace(/^\//,'')
    const desc = $(el).find('p').first().text().trim()
    if (!name) return
    const combined = `${name} ${desc}`.toLowerCase()
    const relevant = ['ai','llm','gpt','agent','saas','api','tool','dashboard','automation'].some(k => combined.includes(k))
    if (relevant) leads.push({ name, desc: desc?.slice(0,60), priority: classify(`${name} ${desc}`) })
  })
  return { source: 'GitHub Trending', status: `✅ OK`, count: leads.length, leads: leads.slice(0,3) }
}

async function testHNLaunches() {
  const yesterday = Math.floor((Date.now() - 86400000 * 7) / 1000)
  const res = await fetch(`https://hn.algolia.com/api/v1/search?query=Launch+HN&tags=ask_hn&numericFilters=created_at_i>${yesterday}&hitsPerPage=5`)
  if (!res.ok) return { source: 'YC Launches (HN)', status: `❌ HTTP ${res.status}`, leads: [] }
  const data = await res.json()
  const hits = (data?.hits ?? []).filter(h => h.title?.toLowerCase().startsWith('launch hn:'))
  const leads = hits.map(h => {
    const clean = h.title.replace(/^launch hn:\s*/i,'')
    const name = clean.split(/[–—-]/)[0].replace(/\(YC [SW]\d+\)/i,'').trim()
    const desc = clean.split(/[–—]/).slice(1).join(' ').trim()
    return { name, desc: desc?.slice(0,60), founder: h.author, priority: classify(desc) }
  })
  return { source: 'YC Launches (HN)', status: `✅ OK`, count: hits.length, leads }
}

async function run() {
  console.log('\n🦤 Dodo Leads — Scraper Test (updated sources)\n' + '─'.repeat(55))
  const tests = await Promise.allSettled([testProductHunt(), testHN(), testBetaList(), testDevTo(), testGitHub(), testHNLaunches()])
  for (const r of tests) {
    const d = r.status === 'fulfilled' ? r.value : { source: '?', status: `❌ CRASHED: ${r.reason}`, leads: [] }
    console.log(`\n📡 ${d.source}`)
    console.log(`   ${d.status}${d.count !== undefined ? ` — ${d.count} leads` : ''}`)
    d.leads?.slice(0,3).forEach(l => {
      console.log(`     • ${l.name} ${l.priority}`)
      if (l.desc) console.log(`       "${l.desc}"`)
      if (l.founder) console.log(`       Founder: ${l.founder}${l.twitter ? ` (${l.twitter})` : ''}`)
    })
  }
  console.log('\n' + '─'.repeat(55) + '\n')
}

run().catch(console.error)

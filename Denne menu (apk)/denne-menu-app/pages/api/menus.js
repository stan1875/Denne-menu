const RESTAURANTS = [
  { id: 'phillscorner', name: "Phill's Corner", url: 'https://www.phillscorner.cz/menu/', tier: 'top', type: 'webnode' },
  { id: 'ctyrka', name: 'Čtyrka', url: 'https://www.ctyr-ka.cz', tier: 'top', type: 'webnode' },
  { id: 'twenty7', name: 'Twenty7', url: 'https://www.twenty7.cz', tier: 'top', type: 'closed' },
  { id: 'vnitroblock', name: 'Vnitroblock', url: 'https://www.vnitroblock.cz/obedove-menu', tier: 'top', type: 'link' },
  { id: 'mexicka', name: 'Mexická Holešovice', url: 'https://www.mexickaholesovice.cz/menu/', tier: 'top', type: 'link' },
  { id: 'homekitchen', name: 'Home Kitchen', url: 'https://home-kitchen.cz', tier: 'ok', type: 'link' },
  { id: 'osada', name: 'Osada', url: 'https://osada.choiceqr.com/section:odpoledni-nabidka/odpoledni-nabidka', tier: 'ok', type: 'link' },
  { id: 'puglia', name: 'Puglia (Czechotel)', url: 'https://www.czechotel.com/puglia-menu/', tier: 'ok', type: 'link' },
  { id: 'podparou', name: 'Pod Párou', url: 'https://podparou.eu/denni-menu/', tier: 'ok', type: 'podparou' },
  { id: 'uholise', name: 'U Holíše', url: 'https://www.restauraceuholise.cz', tier: 'ostatni', type: 'link' },
  { id: 'eatery', name: 'The Eatery', url: 'https://www.theeatery.cz/cz/#/', tier: 'ostatni', type: 'link' },
]

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '–')
    .replace(/\s{2,}/g, ' ')
}

function extractWebnode(html) {
  const text = stripHtml(html)
  const start = text.search(/Polévka|polévka/)
  if (start === -1) return null

  const enders = ['Snídaně', 'Na čepu', 'Breakfast', 'Předkrmy', 'Saláty', 'Sendviče', '© 20', 'Košík']
  let end = start + 1800
  for (const e of enders) {
    const pos = text.indexOf(e, start + 60)
    if (pos > 0 && pos < end) end = pos
  }

  return text
    .slice(start, end)
    .split(/\s{3,}|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 5 && l.length < 220)
    .slice(0, 12)
}

function extractPodParou(html) {
  // Pod Párou has menu items in <li> tags with prices like "195,-"
  const items = []
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match
  while ((match = liRegex.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim().replace(/\s+/g, ' ')
    if (text.match(/\d+,-/) && text.length > 15 && text.length < 250) {
      items.push(text)
    }
  }
  return items.length > 0 ? items.slice(0, 12) : null
}

async function fetchSite(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(7000),
  })
  return res.text()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const scrapable = RESTAURANTS.filter(r => r.type === 'webnode' || r.type === 'podparou')

  const scraped = await Promise.allSettled(
    scrapable.map(async (r) => {
      const html = await fetchSite(r.url)
      const menu = r.type === 'webnode' ? extractWebnode(html) : extractPodParou(html)
      return { id: r.id, menu }
    })
  )

  const menuMap = {}
  scraped.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.menu) {
      menuMap[result.value.id] = result.value.menu
    }
  })

  const data = RESTAURANTS.map(r => ({
    ...r,
    menu: menuMap[r.id] || null,
  }))

  res.json(data)
}

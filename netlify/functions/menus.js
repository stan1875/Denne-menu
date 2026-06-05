const RESTAURANTS = [
  // TOP
  { id: 'phillscorner', name: "Phill's Corner", url: 'https://www.phillscorner.cz/menu/', tier: 'top', type: 'webnode', phone: '+420731836988' },
  { id: 'ctyrka', name: 'Čtyrka', url: 'https://www.ctyr-ka.cz', tier: 'top', type: 'webnode', phone: '+420736644881' },
  { id: 'vnitroblock', name: 'Vnitroblock', url: 'https://www.vnitroblock.cz/obedove-menu', tier: 'top', type: 'link', phone: '+420732373069' },
  { id: 'mexicka', name: 'Mexická', url: 'https://www.mexickaholesovice.cz/', tier: 'top', type: 'link', phone: '+420241952157' },
  { id: 'ema', name: 'EMA', url: 'https://www.emaespressobar.cz/komunardu-praha-7', tier: 'top', type: 'link', phone: '+420739797767' },
  // OSTATNI
  { id: 'kolkovna', name: 'Kolkovna', url: 'https://argentinska.kolkovna.cz/#poledni-menu', tier: 'ostatni', type: 'kolkovna', phone: '+420277008884' },
  { id: 'podparou', name: 'Pod Párou', url: 'https://podparou.eu/denni-menu/', tier: 'ostatni', type: 'podparou', phone: '+420771155446' },
  { id: 'homekitchen', name: 'Home Kitchen', url: 'https://home-kitchen.cz', tier: 'ostatni', type: 'link', phone: '+420605263812' },
  { id: 'marinemare', name: 'Marinemare', url: 'https://marinemare.cz/section:poke-do-14-00', tier: 'ostatni', type: 'link', phone: '+420773654573' },
  { id: 'osada', name: 'Osada', url: 'https://osada.choiceqr.com/section:odpoledni-nabidka/odpoledni-nabidka', tier: 'ostatni', type: 'link', phone: '+420777509973' },
  { id: 'puglia', name: 'Puglia', url: 'https://www.czechotel.com/puglia-menu/', tier: 'ostatni', type: 'link', phone: '+420725067949' },
  { id: 'uholise', name: 'U Holíše', url: 'https://www.restauraceuholise.cz', tier: 'ostatni', type: 'link', phone: '+420724100440' },
  { id: 'hamburg', name: 'Hamburg', url: 'https://www.restauracehamburg.cz', tier: 'ostatni', type: 'link', phone: '+420283872256' },
  { id: 'eatery', name: 'The Eatery', url: 'https://www.theeatery.cz/cz/#/', tier: 'ostatni', type: 'link', phone: '+420603945236' },
  { id: 'futfack', name: 'FutFack', url: 'https://jankovcova.ftfck.cz/section:dishes-drinks/main', tier: 'ostatni', type: 'link', phone: '+420605493123' },
]

function htmlToLines(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(html) {
  return htmlToLines(html).replace(/\s{2,}/g, ' ')
}

function extractWebnode(html) {
  const text = htmlToLines(html)
  const start = text.search(/Polévka|polévka/)
  if (start === -1) return null
  const enders = ['Snídaně', 'Na čepu', 'Breakfast', 'Předkrmy', 'Saláty', 'Sendviče', '© 20', 'Košík']
  let end = start + 2000
  for (const e of enders) {
    const pos = text.indexOf(e, start + 60)
    if (pos > 0 && pos < end) end = pos
  }
  return text.slice(start, end)
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5 && l.length < 220)
    .slice(0, 12)
}

function extractPodParou(html) {
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

function extractKolkovna(html) {
  const text = htmlToLines(html)
  const start = text.search(/[Pp]olévka|[Pp]ol[eé]vka/)
  if (start === -1) return null
  const enders = ['Dezerty', 'Nápoje', 'Snídaně', 'À la carte', 'Na čepu', '© 20']
  let end = start + 2000
  for (const e of enders) {
    const pos = text.indexOf(e, start + 60)
    if (pos > 0 && pos < end) end = pos
  }
  return text.slice(start, end)
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5 && l.length < 220)
    .slice(0, 14)
}

async function fetchSite(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(7000),
  })
  return res.text()
}

exports.handler = async function () {
  const scrapable = RESTAURANTS.filter(r => ['webnode', 'podparou', 'kolkovna'].includes(r.type))

  const scraped = await Promise.allSettled(
    scrapable.map(async (r) => {
      const html = await fetchSite(r.url)
      let menu = null
      if (r.type === 'webnode') menu = extractWebnode(html)
      else if (r.type === 'podparou') menu = extractPodParou(html)
      else if (r.type === 'kolkovna') menu = extractKolkovna(html)
      return { id: r.id, menu }
    })
  )

  const menuMap = {}
  scraped.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.menu) {
      menuMap[result.value.id] = result.value.menu
    }
  })

  const data = RESTAURANTS.map(r => ({ ...r, menu: menuMap[r.id] || null }))

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(data),
  }
}

// Community + drops feed.
// Keyless backbone: sneaker-news RSS (datacenter-friendly WordPress feeds).
// Reddit r/Sneakers lights up when free REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET are set
// (Reddit blocks anonymous datacenter requests, so it needs application-only OAuth).
const UA = 'Mozilla/5.0 (compatible; DRIPbot/1.0; +https://drip-two-rho.vercel.app)'

const RSS = [
  { url: 'https://sneakernews.com/feed/', source: 'Sneaker News' },
  { url: 'https://www.nicekicks.com/feed/', source: 'Nice Kicks' },
  { url: 'https://www.justfreshkicks.com/feed/', source: 'Just Fresh Kicks' },
]

const decode = (s = '') =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()

const m1 = (b, re) => { const m = b.match(re); return m ? m[1] : '' }

const findImage = (b) =>
  m1(b, /<media:content[^>]*\burl="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
  m1(b, /<media:thumbnail[^>]*\burl="([^"]+)"/i) ||
  m1(b, /<enclosure[^>]*\burl="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
  m1(b, /<img[^>]+src="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
  m1(b, /(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp))/i) || ''

function parseRSS(xml, source) {
  const isAtom = /<entry[\s>]/.test(xml)
  return xml.split(isAtom ? /<entry[\s>]/ : /<item[\s>]/).slice(1).map((block) => {
    const title = decode(m1(block, /<title[^>]*>([\s\S]*?)<\/title>/i))
    const link = isAtom ? m1(block, /<link[^>]*href="([^"]+)"/i) : decode(m1(block, /<link[^>]*>([\s\S]*?)<\/link>/i))
    const date = m1(block, /<(?:pubDate|updated|published)[^>]*>([\s\S]*?)<\/(?:pubDate|updated|published)>/i)
    if (!title || !link) return null
    return { title: title.slice(0, 140), link, source, image: findImage(block), date, ts: Date.parse(date) || 0 }
  }).filter(Boolean)
}

async function fetchRSS(f) {
  try {
    const r = await fetch(f.url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' } })
    if (!r.ok) return []
    return parseRSS(await r.text(), f.source)
  } catch { return [] }
}

async function fetchReddit() {
  const id = process.env.REDDIT_CLIENT_ID
  const secret = process.env.REDDIT_CLIENT_SECRET
  if (!id || !secret) return []
  try {
    const tok = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: 'grant_type=client_credentials',
    })
    if (!tok.ok) return []
    const { access_token } = await tok.json()
    const r = await fetch('https://oauth.reddit.com/r/Sneakers/hot?limit=20&raw_json=1', { headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': UA } })
    if (!r.ok) return []
    const j = await r.json()
    return (j.data?.children || [])
      .filter((c) => !c.data?.over_18 && !c.data?.quarantine && !c.data?.spoiler)
      .map((c) => {
        const d = c.data
        const img = d.preview?.images?.[0]?.source?.url || (/\.(jpg|jpeg|png|webp)/i.test(d.thumbnail) ? d.thumbnail : '')
        return { title: decode(d.title).slice(0, 140), link: `https://www.reddit.com${d.permalink}`, source: 'Reddit', image: img, date: new Date(d.created_utc * 1000).toUTCString(), ts: d.created_utc * 1000 }
      })
      .filter((p) => p.title)
  } catch { return [] }
}

async function fetchYouTube() {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return []
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=8&relevanceLanguage=en&q=${encodeURIComponent('sneaker review on feet')}&key=${key}`
    const r = await fetch(url)
    if (!r.ok) return []
    const j = await r.json()
    return (j.items || []).map((it) => {
      const vid = it.id?.videoId
      if (!vid) return null
      const sn = it.snippet || {}
      const img = sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || ''
      return { title: decode(sn.title).slice(0, 140), link: `https://www.youtube.com/watch?v=${vid}`, source: 'YouTube', image: img, date: sn.publishedAt, ts: Date.parse(sn.publishedAt) || 0 }
    }).filter(Boolean)
  } catch { return [] }
}

export default async function handler(req, res) {
  try {
    const groups = await Promise.all([...RSS.map(fetchRSS), fetchReddit(), fetchYouTube()])
    const seen = new Set()
    let items = groups.flat().filter((it) => {
      if (!it.image) return false // every card must have an image
      // keep full link as key — YouTube's unique id lives in ?v=
      const k = /youtube\.com/.test(it.link) ? it.link : it.link.split('?')[0]
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    items.sort((a, b) => b.ts - a.ts)
    items = items.slice(0, 30)
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json({ items, count: items.length, reddit: !!process.env.REDDIT_CLIENT_ID })
  } catch (e) {
    res.status(200).json({ items: [], error: String(e).slice(0, 120) })
  }
}

// Live sneaker catalog search via KicksDB (StockX) — turns the app's 42-shoe seed into
// the entire real catalog. Returns app-shaped shoe objects (with a derived hex so the
// outfit engine can style them). Activates when SNEAKERS_API_KEY is set.
const BASE = 'https://api.sneakersapi.dev/api/v3/stockx/products'

const COLORS = {
  black: '#1a1a1a', white: '#f2f2f0', grey: '#8d8d92', gray: '#8d8d92', cream: '#ece3d0',
  beige: '#cbbfa6', sand: '#cdb79e', tan: '#b99873', brown: '#6b4f3a', navy: '#23314f',
  blue: '#2f6fb0', teal: '#1f8a80', mint: '#9fe0c6', green: '#2f7d4f', olive: '#5c5b3e',
  yellow: '#e8c34a', gold: '#c9a24a', orange: '#d2762f', infrared: '#c1262d', red: '#c1262d',
  maroon: '#7a2d35', burgundy: '#7a2d35', pink: '#d98aa6', purple: '#6d4aa0', lavender: '#b6b0c4',
  silver: '#c4c4c8', volt: '#cde000', bred: '#1a1a1a', panda: '#1c1c1c',
}
const hexFromTitle = (t = '') => {
  const tl = t.toLowerCase()
  for (const k of Object.keys(COLORS)) if (tl.includes(k)) return COLORS[k]
  return '#8d8d92'
}
const matFromText = (t = '') => {
  const x = t.toLowerCase()
  if (/suede|nubuck/.test(x)) return 'suede'
  if (/canvas/.test(x)) return 'canvas'
  if (/primeknit|flyknit|knit/.test(x)) return 'knit'
  if (/mesh/.test(x)) return 'mesh'
  if (/leather/.test(x)) return 'leather'
  return 'synthetic'
}
const TAGS_BY_CAT = {
  lifestyle: ['retro', 'classic', 'court'], running: ['runner', 'techy'], basketball: ['court', 'retro', 'hype'],
  skate: ['skate', 'retro'], trail: ['trail', 'techy'],
}

export default async function handler(req, res) {
  const key = process.env.SNEAKERS_API_KEY
  if (!key) { res.status(200).json({ available: false, items: [] }); return }
  const q = (req.query?.q || '').toString().slice(0, 100)
  const limit = Math.min(40, parseInt(req.query?.limit, 10) || 24)
  try {
    const url = `${BASE}?limit=${limit}&product_type=sneakers${q ? `&query=${encodeURIComponent(q)}` : ''}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    if (!r.ok) { res.status(200).json({ available: true, items: [], reason: r.status }); return }
    const data = (await r.json()).data || []
    const items = data.map((p) => {
      const cat = (p.product_type || p.category || 'lifestyle').toLowerCase()
      const category = ['running', 'basketball', 'skate', 'trail'].find((c) => cat.includes(c)) || 'lifestyle'
      return {
        id: 'kd-' + p.id,
        brand: p.brand || '',
        model: p.primary_title || p.model || p.title || '',
        colorway: p.secondary_title || '',
        image: p.image || null,
        price: p.min_price || (p.avg_price ? Math.round(p.avg_price) : 0) || 120,
        marketPrice: p.avg_price ? Math.round(p.avg_price) : null,
        hex: hexFromTitle(p.title || ''),
        material: matFromText(`${p.title || ''} ${p.short_description || ''}`),
        category,
        styleTags: TAGS_BY_CAT[category] || ['classic'],
        gender: 'unisex',
        popularity: p.weekly_orders ? Math.min(99, 62 + Math.round(Math.log10(p.weekly_orders + 1) * 14)) : 70,
        rating: 4.6,
        link: p.link || null,
        sku: p.sku || null,
        live: true,
      }
    }).filter((x) => x.image && x.model)
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400')
    res.status(200).json({ available: true, items })
  } catch (e) {
    res.status(200).json({ available: true, items: [], error: String(e).slice(0, 100) })
  }
}

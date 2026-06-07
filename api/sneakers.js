// Live sneaker market data via KicksDB / sneakersapi.dev (StockX).
// Activates when SNEAKERS_API_KEY is set. Returns real price range + image + buy link.
const BASE = 'https://api.sneakersapi.dev/api/v3/stockx/products'

export default async function handler(req, res) {
  const key = process.env.SNEAKERS_API_KEY
  if (!key) { res.status(200).json({ available: false }); return }
  const q = (req.query?.q || '').toString().slice(0, 120)
  if (!q.trim()) { res.status(400).json({ error: 'missing q' }); return }

  try {
    const r = await fetch(`${BASE}?limit=8&product_type=sneakers&query=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!r.ok) { res.status(200).json({ available: true, found: false, reason: r.status }); return }
    const data = (await r.json()).data || []
    if (!data.length) { res.status(200).json({ available: true, found: false }); return }

    // best match by query-word overlap with the product title
    const qw = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
    const score = (t) => { const tl = (t || '').toLowerCase(); return qw.filter((w) => tl.includes(w)).length }
    const best = data.slice().sort((a, b) => score(b.title) - score(a.title))[0]

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({
      available: true,
      found: true,
      product: {
        title: best.title,
        brand: best.brand,
        sku: best.sku || null,
        image: best.image || null,
        minPrice: best.min_price ?? null,
        avgPrice: best.avg_price != null ? Math.round(best.avg_price) : null,
        maxPrice: best.max_price ?? null,
        weeklyOrders: best.weekly_orders ?? null,
        link: best.link || null,
      },
    })
  } catch (e) {
    res.status(200).json({ available: true, found: false, error: String(e).slice(0, 100) })
  }
}

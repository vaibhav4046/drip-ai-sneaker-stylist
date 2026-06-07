import { useState, useMemo, useEffect } from 'react'
import { ShoeImage, Swatch } from './ShoeImage.jsx'
import { Icon } from './Icon.jsx'
import { OccasionPicker, WeatherPill, SectionHeader, ShoeRail } from './Bits.jsx'
import { OutfitCard } from './OutfitCard.jsx'
import { useStore } from '../store/useStore.js'
import { SHOES } from '../data/shoes.js'
import { generateOutfit } from '../lib/outfitEngine.js'
import { similar } from '../lib/recsys.js'
import { convert } from '../data/currencies.js'
import { nameColor, colorTemp } from '../lib/color.js'
import { careAdvice } from '../lib/care.js'
import { shopLinks } from '../lib/links.js'

const marketCache = new Map() // per-session cache of live market lookups (saves API quota)

export function ShoeDetail({ shoe, presetOccasion, onRefreshWeather, onSelect }) {
  const { profile, weather, closet, ownedAccessoryIds, likes, addShoe, removeShoe, wearShoe, toggleLike, track } = useStore()
  const [occasionId, setOccasionId] = useState(presetOccasion || 'casual')
  const [variant, setVariant] = useState(0)
  const [market, setMarket] = useState(null)
  const owned = closet.some((s) => s.id === shoe.id)
  const liked = likes.includes(shoe.id)

  useEffect(() => { track('view', shoe.id) }, [shoe.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // live market data (real StockX prices via KicksDB) when the key is configured
  useEffect(() => {
    if (marketCache.has(shoe.id)) { setMarket(marketCache.get(shoe.id)); return }
    let alive = true
    setMarket(null)
    const ac = new AbortController()
    fetch(`/api/sneakers?q=${encodeURIComponent(`${shoe.brand} ${shoe.model} ${shoe.colorway}`)}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { const p = d?.found ? d.product : null; marketCache.set(shoe.id, p); if (alive) setMarket(p) })
      .catch(() => {})
    return () => { alive = false; ac.abort() }
  }, [shoe.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const result = useMemo(
    () => generateOutfit({ shoe, occasionId, gender: profile.gender, stylePref: profile.stylePref, weather, ownedAccessoryIds, variant }),
    [shoe, occasionId, profile.gender, profile.stylePref, weather, ownedAccessoryIds, variant],
  )
  const more = useMemo(() => similar(shoe, SHOES, 8), [shoe])
  const care = careAdvice(shoe, weather)

  return (
    <div className="space-y-5">
      <div className="relative">
        <ShoeImage shoe={shoe} className="aspect-[16/11] w-full" rounded="rounded-3xl" w={900} />
        <button type="button" onClick={() => toggleLike(shoe.id)} aria-pressed={liked}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90"
          style={{ background: 'rgba(0,0,0,0.6)' }} aria-label={liked ? `Unlike ${shoe.model}` : `Like ${shoe.model}`}>
          <Icon name="Heart" size={18} className={liked ? 'volt-text' : ''} {...(liked ? { fill: 'var(--volt)', strokeWidth: 0 } : {})} />
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold leading-tight">{shoe.model}</h3>
          <p className="text-sm muted">{shoe.brand} · {shoe.colorway}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip text-xs">{nameColor(shoe.hex)}</span>
            <span className="chip text-xs">{colorTemp(shoe.hex)} tone</span>
            <span className="chip text-xs capitalize">{shoe.category}</span>
            <span className="chip text-xs" title="Hype score — DRIP popularity, not a fake review"><Icon name="Flame" size={12} /> {shoe.popularity} hype</span>
          </div>
        </div>
        <div className="text-lg font-extrabold">{convert(shoe.price, profile.currency)}</div>
      </div>

      {care && (
        <div className="rounded-2xl p-3" style={{ background: care.level === 'high' ? 'rgba(255,84,112,0.1)' : 'rgba(255,180,84,0.1)', border: `1px solid ${care.level === 'high' ? 'rgba(255,84,112,0.3)' : 'rgba(255,180,84,0.35)'}` }}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: care.level === 'high' ? 'var(--danger)' : '#ffb454' }}>
            <Icon name="CloudRain" size={14} /> Weather check
          </div>
          <p className="mt-1 text-sm leading-relaxed">{care.msg}</p>
        </div>
      )}

      {owned ? (
        <button className="btn btn-ghost w-full" onClick={() => removeShoe(shoe.id)}><Icon name="Trash2" size={18} /> Remove from closet</button>
      ) : (
        <button className="btn btn-primary w-full" onClick={() => addShoe(shoe)}><Icon name="Plus" size={18} /> Add to closet</button>
      )}

      {market && (market.avgPrice || market.minPrice) && (
        <div className="card p-4 fade-up">
          <div className="mb-2 flex items-center gap-1.5"><Icon name="TrendingUp" size={15} className="volt-text" /><span className="label">Live market · StockX</span></div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold">{convert(market.avgPrice || market.minPrice, profile.currency)}</div>
              <div className="text-xs muted">
                avg resale{market.minPrice && market.maxPrice ? ` · range ${convert(market.minPrice, profile.currency)}–${convert(market.maxPrice, profile.currency)}` : ''}
              </div>
            </div>
            {market.link && (
              <a href={market.link} target="_blank" rel="sponsored nofollow noreferrer" className="btn btn-primary text-sm shrink-0"><Icon name="ExternalLink" size={15} /> Buy on StockX</a>
            )}
          </div>
          {market.weeklyOrders ? <div className="mt-2 text-xs muted">{market.weeklyOrders.toLocaleString()} bought this week</div> : null}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Style for</span>
          <WeatherPill weather={weather} onRefresh={onRefreshWeather} />
        </div>
        <OccasionPicker value={occasionId} onChange={(v) => { setOccasionId(v); setVariant(0) }} />
      </div>

      <OutfitCard result={result} shoe={shoe} currency={profile.currency}
        onShuffle={() => setVariant((v) => v + 1)}
        onWear={() => { if (!owned) addShoe(shoe); wearShoe(shoe.id) }} />

      <div>
        <SectionHeader title="More like this" icon="Sparkles" />
        <ShoeRail shoes={more} currency={profile.currency} onSelect={(s) => onSelect?.(s)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {shopLinks(`${shoe.brand} ${shoe.model} ${shoe.colorway}`).map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="sponsored nofollow noreferrer" className="chip text-xs">
            <Icon name="ShoppingBag" size={13} /> {l.label}
          </a>
        ))}
      </div>
      <p className="text-[11px] muted">Some shop links may earn DRIP a commission. Live resale via StockX · prices update hourly.</p>
    </div>
  )
}

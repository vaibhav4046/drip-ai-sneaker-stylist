import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { SHOES, getShoe } from '../data/shoes.js'
import { tasteProfile, recommend, searchRank, similar, dropOfTheDay } from '../lib/recsys.js'
import { ShoeImage } from '../components/ShoeImage.jsx'
import { ShoeCard } from '../components/ShoeCard.jsx'
import { Sheet } from '../components/Sheet.jsx'
import { ShoeDetail } from '../components/ShoeDetail.jsx'
import { SectionHeader, ShoeRail, Reveal } from '../components/Bits.jsx'
import { CommunityRail } from '../components/CommunityRail.jsx'
import { Icon } from '../components/Icon.jsx'
import { convert } from '../data/currencies.js'

const todayStr = () => new Date().toISOString().slice(0, 10)

export function Home({ onRefreshWeather, onNavigate }) {
  const { profile, likes, interactions, closet, recentSearches, addSearch, streak, onboarded, dismissOnboarding, budgetFilter, setBudgetFilter } = useStore()
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const inBudget = (s) => !budgetFilter || s.price <= budgetFilter

  const taste = useMemo(() => tasteProfile(interactions, getShoe), [interactions])
  const ownedIds = useMemo(() => closet.map((s) => s.id), [closet])

  const forYou = useMemo(() => recommend(SHOES, taste, { k: 12, seed: interactions.length, stylePref: profile.stylePref }), [taste, interactions.length, profile.stylePref])
  const trending = useMemo(() => [...SHOES].sort((a, b) => b.popularity - a.popularity).slice(0, 10), [])
  const newDrops = useMemo(() => SHOES.filter((s) => s.isNew).sort((a, b) => (b.releaseDate > a.releaseDate ? 1 : -1)), [])
  const drop = useMemo(() => dropOfTheDay(SHOES, todayStr()), [])
  const lastLiked = likes[0] ? getShoe(likes[0]) : null
  const becauseLiked = useMemo(() => (lastLiked ? similar(lastLiked, SHOES, 10) : []), [lastLiked])

  // live catalog search (entire StockX DB via KicksDB) with local fallback
  const [liveResults, setLiveResults] = useState(null)
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setLiveResults(null); return }
    const ac = new AbortController()
    const id = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`, { signal: ac.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setLiveResults(Array.isArray(d?.items) ? d.items : []))
        .catch(() => {})
    }, 350)
    return () => { clearTimeout(id); ac.abort() }
  }, [query])
  const localResults = useMemo(() => (query.trim() ? searchRank(query, SHOES, taste) : []), [query, taste])
  const results = liveResults && liveResults.length ? liveResults : localResults
  const searching = query.trim().length > 0

  // live "hot right now" from the real StockX catalog
  const [liveHot, setLiveHot] = useState([])
  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/search?limit=14', { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (Array.isArray(d?.items)) setLiveHot(d.items) })
      .catch(() => {})
    return () => ac.abort()
  }, [])

  const open = (s) => setSelected(s)

  return (
    <div className="space-y-6">
      {/* onboarding — first run only */}
      {!onboarded && (
        <div className="card p-4 fade-up" style={{ borderColor: 'var(--volt)' }}>
          <div className="flex items-center gap-1.5"><Icon name="Sparkles" size={16} className="volt-text" /><span className="label">New here?</span></div>
          <h2 className="mt-1 text-lg font-extrabold leading-tight">DRIP styles outfits around <span className="volt-text">your</span> sneakers.</h2>
          <p className="mt-1 text-sm muted">Add a pair → get outfits for any occasion, weather-aware, with shop links. Tap the camera to color-match a fit.</p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-primary flex-1" onClick={() => { dismissOnboarding(); onNavigate?.('closet') }}><Icon name="Plus" size={16} /> Add my sneakers</button>
            <button className="btn btn-ghost" onClick={dismissOnboarding}>Got it</button>
          </div>
        </div>
      )}

      {/* streak */}
      {onboarded && streak >= 1 && (
        <div className="flex items-center justify-between rounded-2xl px-4 py-2.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <span className="flex items-center gap-2 text-sm font-semibold"><Icon name="Flame" size={16} className="volt-text" /> {streak === 1 ? 'Welcome to DRIP' : `${streak}-day streak`}</span>
          <span className="text-xs muted">{profile.name ? `Hey ${profile.name}` : 'Fresh fits daily'}</span>
        </div>
      )}

      {/* search */}
      <div className="flex items-center gap-2 input" style={{ padding: '10px 14px' }}>
        <Icon name="Search" size={18} className="muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && query.trim() && addSearch(query)}
          placeholder="Search sneakers, colors, vibes…"
          aria-label="Search sneakers, colors and styles"
          className="w-full bg-transparent text-sm outline-none"
        />
        {query && <button onClick={() => setQuery('')} aria-label="Clear search"><Icon name="X" size={16} className="muted" /></button>}
      </div>

      {budgetFilter && (
        <button onClick={() => setBudgetFilter(null)} className="chip chip-active self-start" aria-label="Clear budget filter">
          Under {convert(budgetFilter, profile.currency)} <Icon name="X" size={13} />
        </button>
      )}

      {searching ? (
        <div className="space-y-4">
          {recentSearches.length > 0 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {recentSearches.map((r) => (
                <button key={r} onClick={() => setQuery(r)} className="chip whitespace-nowrap text-xs"><Icon name="RefreshCw" size={12} /> {r}</button>
              ))}
            </div>
          )}
          <SectionHeader title={`${results.length} result${results.length === 1 ? '' : 's'}`} icon="Search" />
          {results.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {results.filter(inBudget).map((s) => <ShoeCard key={s.id} shoe={s} currency={profile.currency} owned={ownedIds.includes(s.id)} onClick={() => open(s)} />)}
            </div>
          ) : (
            <p className="py-10 text-center text-sm muted">No matches. Try “white”, “retro”, “Jordan”, or “chunky”.</p>
          )}
        </div>
      ) : (
        <>
          {/* drop of the day */}
          <button onClick={() => open(drop)} className="relative block w-full overflow-hidden rounded-3xl text-left">
            <ShoeImage shoe={drop} className="aspect-[16/10] w-full" rounded="rounded-3xl" w={900} overlay />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}>Drop of the day</span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight">{drop.colorway} {drop.model}</h2>
              <p className="text-sm muted">{drop.brand} · {convert(drop.price, profile.currency)}</p>
            </div>
          </button>

          {/* trending */}
          <div>
            <SectionHeader title="Trending now" icon="Flame" />
            <ShoeRail shoes={trending.filter(inBudget)} currency={profile.currency} onSelect={open} />
          </div>

          {/* hot right now — live from the real StockX catalog */}
          {liveHot.length > 0 && (
            <Reveal>
              <SectionHeader title="Hot on StockX" icon="Flame" />
              <ShoeRail shoes={liveHot.filter(inBudget)} currency={profile.currency} onSelect={open} />
            </Reveal>
          )}

          {/* community / drops feed (live, keyless) */}
          <Reveal><CommunityRail /></Reveal>

          {/* for you */}
          <div>
            <SectionHeader title={taste ? 'For you' : 'Popular picks'} icon="Sparkles" />
            {taste && <p className="mb-2.5 -mt-1.5 text-xs muted">Tuned to your taste — likes, views & wears shape this.</p>}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {forYou.filter(inBudget).map((s) => <ShoeCard key={s.id} shoe={s} currency={profile.currency} owned={ownedIds.includes(s.id)} onClick={() => open(s)} />)}
            </div>
          </div>

          {/* new drops */}
          {newDrops.length > 0 && (
            <Reveal>
              <SectionHeader title="New this week" icon="Zap" />
              <ShoeRail shoes={newDrops.filter(inBudget)} currency={profile.currency} onSelect={open} />
            </Reveal>
          )}

          {/* because you liked */}
          {becauseLiked.length > 0 && (
            <Reveal>
              <SectionHeader title={`Because you liked ${lastLiked.model}`} icon="Heart" />
              <ShoeRail shoes={becauseLiked.filter(inBudget)} currency={profile.currency} onSelect={open} />
            </Reveal>
          )}
        </>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.model || ''}>
        {selected && <ShoeDetail shoe={selected} onRefreshWeather={onRefreshWeather} onSelect={(s) => setSelected(s)} />}
      </Sheet>
    </div>
  )
}

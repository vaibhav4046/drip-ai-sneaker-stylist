import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import { SHOES, BRANDS, getShoe } from '../data/shoes.js'
import { tasteProfile, recommend } from '../lib/recsys.js'
import { ShoeCard } from '../components/ShoeCard.jsx'
import { Sheet } from '../components/Sheet.jsx'
import { ShoeDetail } from '../components/ShoeDetail.jsx'
import { PageHeader, EmptyState, SectionHeader } from '../components/Bits.jsx'
import { Icon } from '../components/Icon.jsx'

export function Closet({ onRefreshWeather }) {
  const { closet, profile, interactions, addShoe } = useStore()
  const [selected, setSelected] = useState(null)
  const [browse, setBrowse] = useState(false)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('All')

  const wearNext = useMemo(() => {
    if (!closet.length) return null
    return [...closet].sort((a, b) => (a.wears || 0) - (b.wears || 0) || (a.lastWorn || a.addedAt) - (b.lastWorn || b.addedAt))[0]
  }, [closet])

  const taste = useMemo(() => tasteProfile(interactions, getShoe), [interactions])
  const suggested = useMemo(() => recommend(SHOES, taste, { exclude: closet.map((s) => s.id), k: 6, seed: closet.length, stylePref: profile.stylePref }), [taste, closet, profile.stylePref])

  const browseList = useMemo(() => {
    const owned = new Set(closet.map((s) => s.id))
    return SHOES.filter((s) => !owned.has(s.id))
      .filter((s) => brand === 'All' || s.brand === brand)
      .filter((s) => `${s.brand} ${s.model} ${s.colorway}`.toLowerCase().includes(q.toLowerCase()))
  }, [closet, q, brand])

  return (
    <div>
      <PageHeader
        title="Closet"
        sub={`${closet.length} pair${closet.length === 1 ? '' : 's'} · ${closet.reduce((n, s) => n + (s.wears || 0), 0)} wears`}
        right={<button className="btn btn-primary px-4 py-2.5 text-sm" onClick={() => setBrowse(true)}><Icon name="Plus" size={16} /> Add</button>}
      />

      {wearNext && (
        <button onClick={() => setSelected(wearNext)} className="card mb-5 flex w-full items-center gap-3 p-3 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}><Icon name="RotateCw" size={19} /></span>
          <div className="min-w-0 flex-1">
            <div className="label">Wear next</div>
            <div className="truncate text-sm font-bold">{wearNext.colorway} {wearNext.model}</div>
          </div>
          <span className="text-xs muted">{wearNext.wears || 0} wears</span>
        </button>
      )}

      {closet.length === 0 ? (
        <EmptyState title="No kicks yet" subtitle="Add your sneakers to start building outfits."
          action={<button className="btn btn-primary mt-2" onClick={() => setBrowse(true)}><Icon name="Plus" size={18} /> Add sneakers</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {closet.map((s) => <ShoeCard key={s.id} shoe={s} currency={profile.currency} owned onClick={() => setSelected(s)} />)}
        </div>
      )}

      {suggested.length > 0 && (
        <div className="mt-7">
          <SectionHeader title="Add to your rotation" icon="Sparkles" />
          <div className="no-scrollbar snap-x flex gap-3 overflow-x-auto pb-1">
            {suggested.map((s) => (
              <div key={s.id} className="w-40 shrink-0 snap-start"><ShoeCard shoe={s} currency={profile.currency} onClick={() => setSelected(s)} /></div>
            ))}
          </div>
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.model || ''}>
        {selected && <ShoeDetail shoe={selected} onRefreshWeather={onRefreshWeather} onSelect={(s) => setSelected(s)} />}
      </Sheet>

      <Sheet open={browse} onClose={() => setBrowse(false)} title="Add sneakers">
        <div className="mb-3 flex items-center gap-2 input" style={{ padding: '10px 14px' }}>
          <Icon name="Search" size={16} className="muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${SHOES.length} sneakers…`} aria-label="Search sneakers to add" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
          {['All', ...BRANDS].map((b) => (
            <button key={b} onClick={() => setBrand(b)} className={`chip whitespace-nowrap text-xs ${brand === b ? 'chip-active' : ''}`}>{b}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-5">
          {browseList.map((s) => (
            <div key={s.id} className="relative">
              <ShoeCard shoe={s} currency={profile.currency} onClick={() => { setSelected(s); setBrowse(false) }} />
              <button onClick={() => addShoe(s)} className="btn btn-primary absolute -bottom-1 right-1 h-9 w-9 rounded-full p-0" aria-label="Quick add"><Icon name="Plus" size={16} /></button>
            </div>
          ))}
          {browseList.length === 0 && <p className="col-span-2 py-6 text-center text-sm muted">No matches.</p>}
        </div>
      </Sheet>
    </div>
  )
}

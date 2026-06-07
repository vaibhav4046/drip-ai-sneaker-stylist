import { ShoeImage } from './ShoeImage.jsx'
import { Icon } from './Icon.jsx'
import { convert } from '../data/currencies.js'
import { useStore } from '../store/useStore.js'

export function ShoeCard({ shoe, currency = 'USD', onClick, owned = false, aspect = 'aspect-square', selected = false }) {
  const likes = useStore((s) => s.likes)
  const toggleLike = useStore((s) => s.toggleLike)
  const liked = likes.includes(shoe.id)

  return (
    <div className="group relative w-full">
      {/* open action — whole card, single accessible name */}
      <button onClick={onClick} className="block w-full text-left"
        aria-label={`${shoe.brand} ${shoe.model}, ${shoe.colorway}, ${convert(shoe.price, currency)}`}>
        <div className={`relative ${aspect} w-full overflow-hidden shoe-tap ${selected ? 'is-selected' : ''}`}>
          <ShoeImage shoe={shoe} className="h-full w-full" rounded="rounded-3xl" />
          <span className="pointer-events-none absolute left-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: 'rgba(0,0,0,0.55)' }}>
            {shoe.brand}
          </span>
          {shoe.isNew && <span className="pointer-events-none absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}>NEW</span>}
          {owned && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}>IN CLOSET</span>}
        </div>
        <div className="px-1 pt-2.5">
          <div className="truncate text-sm font-bold leading-tight">{shoe.model}</div>
          <div className="truncate text-xs muted">{shoe.colorway}</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-bold">{convert(shoe.price, currency)}</span>
            <span className="flex items-center gap-1 text-xs muted" title="Hype score"><Icon name="Flame" size={11} /> {shoe.popularity}</span>
          </div>
        </div>
      </button>

      {/* like — sibling overlay, real button, proper hit target */}
      <button type="button" onClick={() => toggleLike(shoe.id)} aria-pressed={liked}
        aria-label={liked ? `Unlike ${shoe.model}` : `Like ${shoe.model}`}
        className={`absolute top-1.5 flex h-11 w-11 items-center justify-center rounded-full transition active:scale-90 ${shoe.isNew ? 'right-12' : 'right-1.5'}`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: 'rgba(0,0,0,0.55)' }}>
          <Icon name="Heart" size={15} className={liked ? 'volt-text' : ''} {...(liked ? { fill: 'var(--volt)', strokeWidth: 0 } : {})} />
        </span>
      </button>
    </div>
  )
}

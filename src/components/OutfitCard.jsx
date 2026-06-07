import { Icon } from './Icon.jsx'
import { Swatch } from './ShoeImage.jsx'
import { convert } from '../data/currencies.js'
import { nameColor } from '../lib/color.js'
import { shopLinks, reviewLinks } from '../lib/links.js'
import { useStore } from '../store/useStore.js'

function PieceRow({ piece, currency, role }) {
  if (!piece) return null
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Swatch hex={piece.hex} size={26} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{piece.name}</div>
        <div className="text-xs muted">{role} · {nameColor(piece.hex)}</div>
      </div>
      <div className="text-sm font-semibold">{convert(piece.price, currency)}</div>
    </div>
  )
}

export function OutfitCard({ result, shoe, currency = 'USD', onShuffle, onWear }) {
  const lookbook = useStore((s) => s.lookbook)
  const saveFit = useStore((s) => s.saveFit)
  if (!result) return null
  const total =
    (result.top?.price || 0) + (result.bottom?.price || 0) +
    (result.layer?.price || 0) + (result.accessory?.price || 0)
  const q = `${shoe.brand} ${shoe.model} ${shoe.colorway}`
  const fitId = `${shoe.id}-${result.occasion.id}`
  const saved = lookbook.some((f) => f.id === fitId)
  const onSave = () => saveFit({
    id: fitId, shoeId: shoe.id, shoeModel: shoe.model, shoeColorway: shoe.colorway, shoeBrand: shoe.brand, shoePhoto: shoe.photo,
    occasion: result.occasion.label, palette: result.palette,
    pieces: [result.top?.name, result.bottom?.name, result.layer?.name].filter(Boolean),
  })

  return (
    <div className="card p-4 fade-up">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={result.occasion.icon} size={18} className="volt-text" />
          <h3 className="text-base font-bold">{result.occasion.label} fit</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="chip" onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Saved to lookbook' : 'Save fit to lookbook'}>
            <Icon name={saved ? 'BookmarkCheck' : 'Bookmark'} size={15} className={saved ? 'volt-text' : ''} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button className="chip" onClick={onShuffle} aria-label="Shuffle outfit">
            <Icon name="Shuffle" size={15} /> Shuffle
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        {result.palette.map((h, i) => (
          <Swatch key={i} hex={h} size={i === 0 ? 30 : 24} ring={i === 0} />
        ))}
        <span className="ml-1 text-xs muted">palette</span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
        <PieceRow piece={result.top} currency={currency} role="Top" />
        <PieceRow piece={result.bottom} currency={currency} role="Bottom" />
        {result.layer && <PieceRow piece={result.layer} currency={currency} role="Layer" />}
        {result.accessory && <PieceRow piece={result.accessory} currency={currency} role="Accessory" />}
      </div>

      <p className="mt-3 text-sm leading-relaxed muted">{result.rationale}</p>

      <div className="mt-3 rounded-2xl p-3" style={{ background: 'rgba(255,84,112,0.08)', border: '1px solid rgba(255,84,112,0.22)' }}>
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--danger)' }}>
          <Icon name="X" size={14} /> Don’t wear
        </div>
        <ul className="space-y-1">
          {result.dontWear.map((d, i) => <li key={i} className="text-sm muted">· {d}</li>)}
        </ul>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm muted">Outfit total</span>
        <span className="text-lg font-extrabold">{convert(total, currency)}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="btn btn-primary" onClick={onWear}><Icon name="Check" size={18} /> Wear this</button>
        <a className="btn btn-ghost" href={shopLinks(q)[0].url} target="_blank" rel="sponsored nofollow noreferrer">
          <Icon name="ShoppingBag" size={18} /> Shop pieces
        </a>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {shopLinks(q).map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="sponsored nofollow noreferrer" className="chip text-xs">
            <Icon name="ExternalLink" size={13} /> {l.label}
          </a>
        ))}
        {reviewLinks(q).map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="sponsored nofollow noreferrer" className="chip text-xs">
            <Icon name="Star" size={13} /> {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}

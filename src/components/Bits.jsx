import { useState, useRef, useEffect } from 'react'
import { Icon } from './Icon.jsx'
import { OCCASIONS } from '../data/occasions.js'
import { ShoeCard } from './ShoeCard.jsx'

// Defers mounting (and image loading) of a section until it's about to scroll into view.
export function Reveal({ children, minHeight = 220 }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (show) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setShow(true); io.disconnect() } }, { rootMargin: '350px' })
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  return <div ref={ref} style={show ? undefined : { minHeight }}>{show ? children : null}</div>
}

export function OccasionPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OCCASIONS.map((o) => {
        const on = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            className="flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition active:scale-95"
            style={{ background: on ? 'var(--volt)' : 'var(--surface-2)', border: '1px solid var(--line)', color: on ? 'var(--volt-ink)' : 'var(--text)' }}>
            <Icon name={o.icon} size={19} strokeWidth={on ? 2.4 : 2} />
            <span className="text-[10px] font-semibold leading-tight">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function WeatherPill({ weather, onRefresh }) {
  if (!weather) return <button onClick={onRefresh} className="chip"><Icon name="MapPin" size={14} /> Get weather</button>
  const icon = /rain/i.test(weather.condition) ? 'CloudRain' : weather.temp <= 7 ? 'Snowflake' : /clear/i.test(weather.condition) ? 'Sun' : 'Cloud'
  return (
    <button onClick={onRefresh} className="chip">
      <Icon name={icon} size={14} />
      <span className="font-bold">{weather.temp}°C</span>
      <span className="muted">{weather.condition} · {weather.season}</span>
    </button>
  )
}

export function Loader({ label = 'Working…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 muted">
      <Icon name="RefreshCw" size={18} className="spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ icon = 'Footprints', title, subtitle, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}>
        <Icon name={icon} size={26} />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      {subtitle && <p className="text-sm muted">{subtitle}</p>}
      {action}
    </div>
  )
}

export function PageHeader({ title, sub, right }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm muted">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function SectionHeader({ title, icon, action, onAction }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {icon && <Icon name={icon} size={16} className="volt-text" />}
        <span className="label">{title}</span>
      </div>
      {action && <button className="flex items-center gap-1 text-xs font-semibold muted" onClick={onAction}>{action} <Icon name="ArrowRight" size={13} /></button>}
    </div>
  )
}

export function ShoeRail({ shoes, currency, onSelect, width = 'w-40' }) {
  return (
    <div className="no-scrollbar snap-x flex gap-3 overflow-x-auto pb-1">
      {shoes.map((s) => (
        <div key={s.id} className={`${width} shrink-0 snap-start`}>
          <ShoeCard shoe={s} currency={currency} onClick={() => onSelect(s)} />
        </div>
      ))}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

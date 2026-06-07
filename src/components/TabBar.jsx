import { Icon } from './Icon.jsx'

const TABS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'closet', label: 'Closet', icon: 'Footprints' },
  { id: 'scan', label: 'Scan', icon: 'ScanLine', center: true },
  { id: 'stylist', label: 'Stylist', icon: 'Sparkles' },
  { id: 'profile', label: 'You', icon: 'User' },
]

export function TabBar({ active, onChange }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-end justify-around px-3 pt-2"
      style={{
        paddingBottom: 'calc(10px + var(--safe-bottom))',
        background: 'linear-gradient(to top, rgba(9,9,11,0.96), rgba(9,9,11,0.7) 70%, transparent)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {TABS.map((t) => {
        const on = active === t.id
        if (t.center) {
          return (
            <button key={t.id} onClick={() => onChange(t.id)} className="relative -mt-6 flex flex-col items-center gap-1"
              aria-label={t.label} aria-current={on ? 'page' : undefined}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl transition active:scale-95"
                style={{
                  background: on ? 'var(--volt)' : '#16161a',
                  color: on ? 'var(--volt-ink)' : 'var(--text)',
                  border: '1px solid var(--line-2)',
                  boxShadow: on ? '0 10px 30px rgba(204,255,2,0.3)' : '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                <Icon name={t.icon} size={26} strokeWidth={2.2} />
              </span>
            </button>
          )
        }
        return (
          <button key={t.id} onClick={() => onChange(t.id)} className="flex flex-1 flex-col items-center gap-1 py-1.5"
            style={{ color: on ? 'var(--text)' : 'var(--faint)' }} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <Icon name={t.icon} size={22} strokeWidth={on ? 2.4 : 2} className={on ? 'volt-text' : ''} />
            <span className="text-[10px] font-semibold" style={on ? { color: 'var(--text)' } : {}}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

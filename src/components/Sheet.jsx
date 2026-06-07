import { useEffect, useRef } from 'react'
import { Icon } from './Icon.jsx'

export function Sheet({ open, onClose, title, children }) {
  const panelRef = useRef(null)
  const prevFocus = useRef(null)

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    // move focus into the dialog
    const panel = panelRef.current
    const focusables = () => panel?.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])') || []
    requestAnimationFrame(() => { const f = focusables(); (f[0] || panel)?.focus?.() })

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const f = [...focusables()].filter((el) => !el.disabled && el.offsetParent !== null)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="absolute inset-0 fade-in" style={{ background: 'rgba(0,0,0,0.66)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="fade-up relative max-h-[90dvh] w-full max-w-md overflow-y-auto no-scrollbar"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: '28px 28px 0 0', paddingBottom: 'var(--safe-bottom)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
          style={{ background: 'linear-gradient(to bottom, var(--bg-elev) 70%, transparent)' }}>
          <h2 id="sheet-title" className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full btn-ghost" aria-label="Close">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-5 pb-8">{children}</div>
        <div className="mx-auto mb-2 h-1 w-10 rounded-full" style={{ background: 'var(--line-2)' }} />
      </div>
    </div>
  )
}

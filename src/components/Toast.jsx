import { useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { Icon } from './Icon.jsx'

export function Toast() {
  const toast = useStore((s) => s.toast)
  const clearToast = useStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 2200)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center" style={{ bottom: 'calc(96px + var(--safe-bottom))' }} role="status" aria-live="polite">
      <div key={toast.id} className="pop flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
        style={{ background: 'var(--volt)', color: 'var(--volt-ink)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
        <Icon name="Check" size={16} /> {toast.msg}
      </div>
    </div>
  )
}

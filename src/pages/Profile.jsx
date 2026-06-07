import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore.js'
import { getShoe } from '../data/shoes.js'
import { ACCESSORIES } from '../data/outfits.js'
import { CURRENCIES } from '../data/currencies.js'
import { rgbToHsl, hexToRgb } from '../lib/color.js'
import { tasteSummary } from '../lib/recsys.js'
import { Sheet } from '../components/Sheet.jsx'
import { PageHeader, SectionHeader } from '../components/Bits.jsx'
import { Swatch } from '../components/ShoeImage.jsx'
import { Icon } from '../components/Icon.jsx'

const QUIZ = [
  { q: 'Weekend go-to fit?', opts: [{ label: 'Hoodie + cargos', w: { street: 2 } }, { label: 'Tee + clean denim', w: { minimal: 2 } }, { label: 'Knit + trousers', w: { smart: 2 } }] },
  { q: 'Dream sneaker energy?', opts: [{ label: 'Chunky & bold', w: { street: 2 } }, { label: 'Low & clean', w: { minimal: 2 } }, { label: 'Sleek & refined', w: { smart: 1, minimal: 1 } }] },
  { q: 'Color comfort zone?', opts: [{ label: 'Loud statements', w: { street: 2 } }, { label: 'All neutrals', w: { minimal: 2 } }, { label: 'Earthy & muted', w: { smart: 1, minimal: 1 } }] },
  { q: 'A night out means…', opts: [{ label: 'Hype fit, all eyes', w: { street: 2 } }, { label: 'Effortless & simple', w: { minimal: 2 } }, { label: 'Sharp & tailored', w: { smart: 2 } }] },
  { q: 'Accessories?', opts: [{ label: 'Chains & caps', w: { street: 2 } }, { label: 'Less is more', w: { minimal: 2 } }, { label: 'Watch & clean lines', w: { smart: 2 } }] },
  { q: 'How should we style you?', opts: [{ label: "Men's", g: 'male' }, { label: "Women's", g: 'female' }, { label: 'Unisex', g: 'unisex' }, { label: 'Modest', g: 'modest' }] },
]

const Field = ({ label, children }) => (<div className="mb-3"><div className="label mb-1.5">{label}</div>{children}</div>)

function Segmented({ value, onChange, options }) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-xl p-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className="rounded-lg py-2 text-sm font-semibold capitalize transition"
          style={value === o.value ? { background: 'var(--volt)', color: 'var(--volt-ink)' } : { color: 'var(--muted)' }}>{o.label}</button>
      ))}
    </div>
  )
}
const Stat = ({ label, value, sub }) => (
  <div className="rounded-2xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
    <div className="text-2xl font-extrabold">{value}</div>
    <div className="text-xs muted">{label}</div>
    {sub && <div className="mt-0.5 truncate text-[11px] muted">{sub}</div>}
  </div>
)

export function Profile() {
  const { closet, profile, ownedAccessoryIds, likes, interactions, lookbook, removeFit, setProfile, toggleAccessory, resetAll } = useStore()
  const [quiz, setQuiz] = useState(false)
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState({ street: 0, minimal: 0, smart: 0 })
  const [genderPick, setGenderPick] = useState(null)

  const stats = useMemo(() => {
    const wears = closet.reduce((n, s) => n + (s.wears || 0), 0)
    const sorted = [...closet].sort((a, b) => (b.wears || 0) - (a.wears || 0))
    return { pairs: closet.length, wears, most: sorted[0], least: sorted[sorted.length - 1] }
  }, [closet])

  const taste = useMemo(() => tasteSummary(interactions, getShoe), [interactions])

  const dna = useMemo(() => {
    if (!closet.length) return null
    const brands = {}; let neutral = 0, price = 0
    closet.forEach((s) => { brands[s.brand] = (brands[s.brand] || 0) + 1; price += s.price; if (rgbToHsl(hexToRgb(s.hex)).s < 0.16) neutral++ })
    const topBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0][0]
    const avg = Math.round(price / closet.length)
    return { traits: [`${profile.stylePref} leaning`, neutral / closet.length > 0.5 ? 'Neutral-forward' : 'Color-curious', `${topBrand} loyalist`, avg > 150 ? 'Premium taste' : avg < 90 ? 'Value hunter' : 'Balanced spender'] }
  }, [closet, profile.stylePref])

  function answer(opt) {
    if (opt.w) setScores((s) => { const n = { ...s }; Object.entries(opt.w).forEach(([k, v]) => { n[k] += v }); return n })
    if (opt.g) setGenderPick(opt.g)
    if (step < QUIZ.length - 1) setStep(step + 1); else finishQuiz(opt)
  }
  function finishQuiz(lastOpt) {
    const fs = { ...scores }; if (lastOpt.w) Object.entries(lastOpt.w).forEach(([k, v]) => { fs[k] += v })
    const stylePref = Object.entries(fs).sort((a, b) => b[1] - a[1])[0][0]
    setProfile({ stylePref, gender: lastOpt.g || genderPick || profile.gender, quizDone: true })
    setQuiz(false); setStep(0); setScores({ street: 0, minimal: 0, smart: 0 }); setGenderPick(null)
  }

  return (
    <div>
      <PageHeader title={profile.name ? `Hey, ${profile.name}` : 'You'} sub="Your style profile & settings" />

      {/* Taste — learned from behavior */}
      <div className="card mb-4 p-4">
        <SectionHeader title="Your taste" icon="Compass" />
        {taste ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {taste.topTags.map((t) => <span key={t} className="chip text-xs capitalize">{t}</span>)}
              <span className="chip text-xs capitalize">{taste.topCategory}</span>
            </div>
            <p className="text-sm muted">You lean toward <span className="volt-text font-semibold">{taste.color}</span> and <span className="volt-text font-semibold">{taste.tone}</span>. The feed adapts as you browse.</p>
          </div>
        ) : <p className="text-sm muted">Like, view and add sneakers — DRIP learns your taste and tunes your feed.</p>}
      </div>

      {/* Lookbook */}
      <div className="card mb-4 p-4">
        <SectionHeader title={`Lookbook · ${lookbook.length}`} icon="Bookmark" />
        {lookbook.length ? (
          <div className="space-y-2">
            {lookbook.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-xl p-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <div className="flex gap-1">{(f.palette || []).slice(0, 4).map((h, i) => <Swatch key={i} hex={h} size={18} />)}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{f.occasion} · {f.shoeModel}</div>
                  {f.pieces?.length > 0 && <div className="truncate text-xs muted">{f.pieces.join(' · ')}</div>}
                </div>
                <button onClick={() => removeFit(f.id)} aria-label="Remove fit" className="flex h-9 w-9 items-center justify-center rounded-full btn-ghost"><Icon name="X" size={15} /></button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm muted">Save fits from the stylist or any shoe — they land here to re-wear.</p>}
      </div>

      {/* Style DNA */}
      <div className="card mb-4 p-4">
        <SectionHeader title="Style DNA" icon="Sparkles" />
        {dna ? <div className="flex flex-wrap gap-2">{dna.traits.map((t) => <span key={t} className="chip text-xs capitalize">{t}</span>)}</div>
          : <p className="text-sm muted">Add shoes to reveal your Style DNA.</p>}
        <button className="btn btn-primary mt-3 w-full" onClick={() => setQuiz(true)}><Icon name="Wand2" size={18} /> {profile.quizDone ? 'Retake style quiz' : 'Take the style quiz'}</button>
      </div>

      {/* Rotation */}
      <div className="card mb-4 p-4">
        <SectionHeader title="Rotation" icon="RotateCw" />
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Pairs" value={stats.pairs} />
          <Stat label="Total wears" value={stats.wears} />
          <Stat label="Liked" value={likes.length} />
          {stats.least && <Stat label="Needs love" value={`${stats.least.wears || 0}×`} sub={stats.least.model} />}
        </div>
      </div>

      {/* Settings */}
      <div className="card mb-4 p-4">
        <SectionHeader title="Settings" icon="Settings" />
        <Field label="Name"><input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} placeholder="Your name" aria-label="Your name" className="input" /></Field>
        <Field label="Style preference">
          <Segmented value={profile.stylePref} onChange={(v) => setProfile({ stylePref: v })}
            options={[{ value: 'street', label: 'Street' }, { value: 'minimal', label: 'Minimal' }, { value: 'smart', label: 'Smart' }]} />
        </Field>
        <Field label="Style me as">
          <Segmented value={profile.gender} onChange={(v) => setProfile({ gender: v })}
            options={[{ value: 'male', label: 'Men' }, { value: 'female', label: 'Women' }, { value: 'unisex', label: 'Unisex' }, { value: 'modest', label: 'Modest' }]} />
        </Field>
        <Field label="Currency">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {Object.keys(CURRENCIES).map((c) => (
              <button key={c} onClick={() => setProfile({ currency: c })} className={`chip whitespace-nowrap text-xs ${profile.currency === c ? 'chip-active' : ''}`}>{CURRENCIES[c].symbol} {c}</button>
            ))}
          </div>
        </Field>
      </div>

      {/* Accessories */}
      <div className="card mb-4 p-4">
        <SectionHeader title="Accessories you own" icon="Star" />
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((a) => {
            const on = ownedAccessoryIds.includes(a.id)
            return <button key={a.id} onClick={() => toggleAccessory(a.id)} className={`chip text-xs ${on ? 'chip-active' : ''}`}>{on && <Icon name="Check" size={12} />} {a.name}</button>
          })}
        </div>
      </div>

      <button className="btn btn-ghost w-full" onClick={() => { if (confirm('Reset closet, likes, history and profile?')) resetAll() }}><Icon name="Trash2" size={18} /> Reset all data</button>
      <p className="mt-3 text-center text-xs muted">DRIP v2 · data stored on this device</p>

      <Sheet open={quiz} onClose={() => { setQuiz(false); setStep(0); setScores({ street: 0, minimal: 0, smart: 0 }); setGenderPick(null) }} title={`Style quiz · ${step + 1}/${QUIZ.length}`}>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full" style={{ width: `${((step + 1) / QUIZ.length) * 100}%`, background: 'var(--volt)' }} />
        </div>
        <h3 className="mb-4 text-xl font-extrabold">{QUIZ[step].q}</h3>
        <div className="space-y-2">
          {QUIZ[step].opts.map((o) => (
            <button key={o.label} onClick={() => answer(o)} className="card flex w-full items-center justify-between p-4 text-left transition active:scale-[0.98]">
              <span className="font-semibold">{o.label}</span><Icon name="ChevronRight" size={18} />
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}

import { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/useStore.js'
import { SHOES } from '../data/shoes.js'
import { extractPalette, imageToData, nameColor, hexToRgb, contrast, rgbToHsl } from '../lib/color.js'
import { ShoeCard } from '../components/ShoeCard.jsx'
import { ShoeDetail } from '../components/ShoeDetail.jsx'
import { Sheet } from '../components/Sheet.jsx'
import { Swatch } from '../components/ShoeImage.jsx'
import { PageHeader, Loader } from '../components/Bits.jsx'
import { Icon } from '../components/Icon.jsx'

const dist = (a, b) => (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
function nearestShoe(hex, pool = SHOES) {
  const t = hexToRgb(hex)
  const list = pool && pool.length ? pool : SHOES
  let best = list[0], bd = Infinity
  for (const s of list) { const d = dist(t, hexToRgb(s.hex)); if (d < bd) { bd = d; best = s } }
  return best
}
function fitVerdict(palette, shoe) {
  if (palette.length < 2) return { score: 70, label: 'Clean', tips: ['Add one accent color for depth.'] }
  const top = palette.slice(0, 3)
  const c = contrast(top[0].hex, top[1].hex)
  const sats = top.map((p) => rgbToHsl(hexToRgb(p.hex)).s)
  const hasNeutral = sats.some((s) => s < 0.18)
  const loud = sats.filter((s) => s > 0.5).length
  const tonal = c < 1.6 && loud === 0 // intentional monochrome — valid, don't punish
  let score = 55; const tips = []
  if (c >= 1.8 && c <= 14) score += 22
  else if (tonal) score += 18
  else { score += 8; tips.push('Boost contrast between your main pieces.') }
  if (hasNeutral || tonal) score += 14; else tips.push('Anchor the fit with a neutral (black, white, grey, beige).')
  if (loud <= 1) score += 12; else tips.push('Two+ loud colors fight — let one lead.')
  // does it work with the actual sneaker?
  if (shoe) {
    const cs = contrast(shoe.hex, top[0].hex)
    if (cs >= 1.4 && cs <= 16) score += 8
    tips.unshift(`Reads ${cs >= 2.4 ? 'with sharp contrast' : 'tonally'} against your ${shoe.model}.`)
  }
  score = Math.max(40, Math.min(98, score))
  const label = score >= 86 ? 'Heat' : score >= 73 ? 'Solid' : tonal ? 'Tonal' : score >= 60 ? 'Decent' : 'Needs work'
  if (!tips.length) tips.push('Balanced palette — this works.')
  return { score, label, tips }
}

export function Scan({ onRefreshWeather }) {
  const { profile, closet } = useStore()
  const videoRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)
  const [live, setLive] = useState(false)
  const [preview, setPreview] = useState(null)
  const [palette, setPalette] = useState([])
  const [match, setMatch] = useState(null)
  const [verdict, setVerdict] = useState(null)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState(null)
  const [err, setErr] = useState('')
  const [autoHint, setAutoHint] = useState('')

  useEffect(() => () => stopCamera(), [])

  // auto-capture: when the live frame holds steady on a shoe, snap automatically
  useEffect(() => {
    if (!live) { setAutoHint(''); return }
    const c = document.createElement('canvas'); c.width = 32; c.height = 32
    const x = c.getContext('2d', { willReadFrequently: true })
    let prev = null, steady = 0
    const iv = setInterval(() => {
      const v = videoRef.current
      if (!v || v.readyState < 2) return
      x.drawImage(v, 0, 0, 32, 32)
      const d = x.getImageData(0, 0, 32, 32).data
      let sum = 0
      for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2]
      const bright = sum / (d.length / 4 * 3)
      if (prev && bright > 28 && bright < 245) {
        let diff = 0
        for (let i = 0; i < d.length; i += 4) diff += Math.abs(d[i] - prev[i]) + Math.abs(d[i + 1] - prev[i + 1]) + Math.abs(d[i + 2] - prev[i + 2])
        diff /= (d.length / 4 * 3)
        if (diff < 7) steady++; else steady = 0
        setAutoHint(steady >= 2 && steady < 6 ? 'Hold steady — auto-scanning…' : '')
        if (steady >= 6) { clearInterval(iv); setAutoHint(''); capture() }
      } else steady = 0
      prev = d
    }, 130)
    return () => clearInterval(iv)
  }, [live]) // eslint-disable-line react-hooks/exhaustive-deps

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setLive(false)
  }
  async function startCamera() {
    setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      setLive(true)
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() } })
    } catch { setErr('Camera blocked — upload a photo instead.'); fileRef.current?.click() }
  }
  function analyze(source, previewUrl) {
    setBusy(true); setPreview(previewUrl)
    setTimeout(() => {
      const data = imageToData(source)
      if (!data) { setBusy(false); setErr('Could not read image.'); return }
      const pal = extractPalette(data, 5)
      const m = nearestShoe(pal[0].hex, closet) // match the user's own kicks first
      setPalette(pal); setMatch(m); setVerdict(fitVerdict(pal, m)); setBusy(false)
      // natural, AI-written verdict (falls back to the heuristic tips if AI unavailable)
      fetch('/api/stylist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'rate this fit', context: { verdict: { colors: pal.slice(0, 4).map((p) => nameColor(p.hex)), shoe: m ? `${m.colorway} ${m.model}` : '' } } }) })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d && !d.fallback && d.text) setVerdict((v) => (v ? { ...v, ai: d.text } : v)) })
        .catch(() => {})
    }, 60)
  }
  function capture() { const v = videoRef.current; if (!v) return; analyze(v, null); stopCamera() }
  function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return
    const url = URL.createObjectURL(file); const img = new Image()
    img.onload = () => analyze(img, url); img.onerror = () => setErr('Could not load that image.'); img.src = url
  }
  function reset() { setPreview(null); setPalette([]); setMatch(null); setVerdict(null); setErr('') }

  return (
    <div>
      <PageHeader title="Scan" sub="Snap a sneaker — colors, matches & a fit verdict" />

      <div className="card relative mb-4 aspect-square w-full overflow-hidden" style={{ borderRadius: 28 }}>
        {live ? <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          : preview ? <img src={preview} alt="scan" className="h-full w-full object-cover" />
          : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 muted">
              <Icon name="Camera" size={42} />
              <p className="px-8 text-center text-sm">Point at your sneaker or full outfit, or upload a photo.</p>
            </div>
          )}
        {busy && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}><Loader label="Reading colors…" /></div>}
        {live && autoHint && <div className="absolute left-1/2 top-4 -translate-x-1/2 chip text-xs">{autoHint}</div>}
        {live && <button onClick={capture} className="absolute bottom-5 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 active:scale-95" style={{ borderColor: 'var(--volt)', background: 'rgba(204,255,2,0.25)' }} aria-label="Capture photo" />}
      </div>

      {err && <p className="mb-3 text-center text-sm" style={{ color: 'var(--danger)' }}>{err}</p>}

      <div className="mb-5 grid grid-cols-2 gap-2">
        {live ? <button className="btn btn-ghost col-span-2" onClick={stopCamera}><Icon name="X" size={18} /> Stop camera</button>
          : (<>
            <button className="btn btn-primary" onClick={startCamera}><Icon name="Camera" size={18} /> Camera</button>
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Icon name="Plus" size={18} /> Upload</button>
          </>)}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      </div>

      {palette.length > 0 && (
        <div className="card mb-4 p-4 fade-up">
          <div className="mb-3 flex items-center justify-between">
            <span className="label">Extracted palette</span>
            <button className="text-xs volt-text font-semibold" onClick={reset}>Clear</button>
          </div>
          <div className="space-y-2.5">
            {palette.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <Swatch hex={p.hex} size={26} />
                <span className="flex-1 text-sm font-medium">{nameColor(p.hex)}</span>
                <span className="text-xs muted">{Math.round(p.pct * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {verdict && (
        <div className="card mb-4 p-4 fade-up">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--volt)', color: 'var(--volt-ink)' }}>
              <span className="text-2xl font-extrabold">{verdict.score}</span>
            </div>
            <div className="flex-1">
              <div className="label">Fit verdict</div>
              <div className="text-lg font-extrabold">{verdict.label}</div>
            </div>
          </div>
          {verdict.ai
            ? <p className="mt-3 text-sm leading-relaxed">{verdict.ai}</p>
            : <ul className="mt-3 space-y-1">{verdict.tips.map((t, i) => <li key={i} className="text-sm muted">· {t}</li>)}</ul>}
        </div>
      )}

      {match && (
        <div className="mb-4 fade-up">
          <div className="mb-2.5 flex items-center gap-1.5"><Icon name="Sparkles" size={16} className="volt-text" /><span className="label">Closest match</span></div>
          <div className="grid grid-cols-2 gap-3">
            <ShoeCard shoe={match} currency={profile.currency} onClick={() => setSelected(match)} />
            <div className="card flex flex-col justify-center gap-2 p-4">
              <p className="text-sm muted">Not your exact pair? Style it anyway or browse the closet.</p>
              <button className="btn btn-primary text-sm" onClick={() => setSelected(match)}><Icon name="Wand2" size={16} /> Style this</button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.model || ''}>
        {selected && <ShoeDetail shoe={selected} onRefreshWeather={onRefreshWeather} onSelect={(s) => setSelected(s)} />}
      </Sheet>
    </div>
  )
}

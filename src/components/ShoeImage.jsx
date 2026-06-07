import { useState, useRef, useEffect, useMemo } from 'react'
import { photoUrl } from '../data/photos.js'
import { LOCAL_IMAGES } from '../data/localImages.js'
import { luminance, hexToRgb, rgbToHex } from '../lib/color.js'

const darken = (hex, f = 0.5) => {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r * f, g: g * f, b: b * f })
}

// Source priority: self-hosted exact product image → curated real photo → branded tile.
function sources(shoe, w) {
  const arr = []
  if (shoe.image) arr.push(shoe.image) // live KicksDB/StockX product image
  if (LOCAL_IMAGES.has(shoe.id)) arr.push(`/shoes/${shoe.id}.webp`)
  if (shoe.photo) arr.push(photoUrl(shoe.photo, w, w))
  return arr
}

export function ShoeImage({ shoe, className = '', rounded = 'rounded-2xl', w = 700, overlay = false }) {
  const srcs = useMemo(() => sources(shoe, w), [shoe.id, w]) // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [dead, setDead] = useState(false)
  const ref = useRef(null)
  const src = srcs[idx]

  useEffect(() => { setIdx(0); setReady(false); setDead(false) }, [shoe.id])

  // Catch images already complete before onLoad attaches (cache/instant).
  useEffect(() => {
    const img = ref.current
    if (img && img.complete) {
      if (img.naturalWidth > 0) setReady(true)
      else advance()
    }
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps

  function advance() {
    if (idx < srcs.length - 1) { setIdx(idx + 1); setReady(false) } else setDead(true)
  }

  return (
    <div className={`relative overflow-hidden ${rounded} ${className}`} style={{ background: '#121214' }}>
      {!ready && !dead && <div className="absolute inset-0 skeleton" />}
      {!dead && src ? (
        <img
          ref={ref}
          src={src}
          alt={`${shoe.brand} ${shoe.model} — ${shoe.colorway}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setReady(true)}
          onError={advance}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : dead ? (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(150deg, ${shoe.hex}, ${darken(shoe.hex)})` }}>
          <span className="text-sm font-bold uppercase tracking-widest"
            style={{ color: luminance(shoe.hex) > 0.55 ? '#0a0a0b' : '#f6f6f4' }}>{shoe.brand}</span>
        </div>
      ) : null}
      {overlay && <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.0) 45%)' }} />}
    </div>
  )
}

export function Swatch({ hex, size = 22, ring = false }) {
  return (
    <span className="inline-block rounded-full"
      style={{ width: size, height: size, background: hex, boxShadow: ring ? '0 0 0 2px rgba(255,255,255,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}
      title={hex} />
  )
}

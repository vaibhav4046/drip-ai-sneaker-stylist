// Color science: palette extraction (k-means), naming, harmony, contrast.

export const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const int = parseInt(n, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

export const rgbToHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')

export const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: h * 360, s, l }
}

export const hslToHex = ({ h, s, l }) => {
  h /= 360
  const f = (n) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(l, 1 - l)
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return rgbToHex({ r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 })
}

// Relative luminance (perceptual, 0=black 1=white)
export const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

export const isDark = (hex) => luminance(hex) < 0.4

export const contrast = (a, b) => {
  const la = luminance(a), lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// warm / cool / neutral based on hue + saturation
export const colorTemp = (hex) => {
  const { h, s } = rgbToHsl(hexToRgb(hex))
  if (s < 0.12) return 'neutral'
  if (h < 75 || h >= 300) return 'warm'
  if (h >= 75 && h < 180) return s > 0.25 ? 'cool' : 'neutral'
  return 'cool'
}

const NAMED = [
  ['Black', '#000000'], ['Charcoal', '#2b2b2f'], ['Graphite', '#444448'], ['Grey', '#8d8d92'],
  ['Silver', '#c4c4c8'], ['White', '#f6f6f4'], ['Cream', '#ece3d0'], ['Beige', '#cbbfa6'],
  ['Tan', '#b99873'], ['Brown', '#6b4f3a'], ['Navy', '#23314f'], ['Blue', '#2f6fb0'],
  ['Sky', '#7ab2dd'], ['Teal', '#1f8a80'], ['Mint', '#9fe0c6'], ['Green', '#2f7d4f'],
  ['Olive', '#5c5b3e'], ['Yellow', '#e8c34a'], ['Mustard', '#c9a24a'], ['Orange', '#d2762f'],
  ['Red', '#c1262d'], ['Maroon', '#7a2d35'], ['Pink', '#d98aa6'], ['Purple', '#6d4aa0'],
  ['Lavender', '#b6b0c4'],
]

export const nameColor = (hex) => {
  const t = hexToRgb(hex)
  let best = NAMED[0][0], bestD = Infinity
  for (const [name, h] of NAMED) {
    const c = hexToRgb(h)
    const d = (t.r - c.r) ** 2 + (t.g - c.g) ** 2 + (t.b - c.b) ** 2
    if (d < bestD) { bestD = d; best = name }
  }
  return best
}

// Color harmony returns related hues for the engine to chase.
export const harmony = (hex) => {
  const hsl = rgbToHsl(hexToRgb(hex))
  const at = (deg) => hslToHex({ ...hsl, h: (hsl.h + deg + 360) % 360, s: Math.max(0.25, hsl.s), l: Math.min(0.6, Math.max(0.4, hsl.l)) })
  return {
    complementary: at(180),
    analogous: [at(-30), at(30)],
    triadic: [at(120), at(240)],
  }
}

const distance = (a, b) => (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2

// k-means dominant-color extraction from an HTMLCanvas/Image-derived ImageData.
export const extractPalette = (imageData, k = 5) => {
  const { data, width, height } = imageData
  const pixels = []
  // sample ~4000 pixels for speed
  const step = Math.max(1, Math.floor((width * height) / 4000))
  for (let i = 0; i < data.length; i += 4 * step) {
    const a = data[i + 3]
    if (a < 125) continue
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
  }
  if (!pixels.length) return [{ hex: '#888888', pct: 1 }]

  // init centroids spread across the sample
  let centroids = Array.from({ length: k }, (_, i) => pixels[Math.floor((i + 0.5) * pixels.length / k)])
  let assign = new Array(pixels.length).fill(0)

  for (let iter = 0; iter < 8; iter++) {
    for (let p = 0; p < pixels.length; p++) {
      let bd = Infinity, bi = 0
      for (let c = 0; c < centroids.length; c++) {
        const d = distance(pixels[p], centroids[c])
        if (d < bd) { bd = d; bi = c }
      }
      assign[p] = bi
    }
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (let p = 0; p < pixels.length; p++) {
      const s = sums[assign[p]]
      s.r += pixels[p].r; s.g += pixels[p].g; s.b += pixels[p].b; s.n++
    }
    centroids = sums.map((s, i) =>
      s.n ? { r: s.r / s.n, g: s.g / s.n, b: s.b / s.n } : centroids[i])
  }

  const counts = new Array(k).fill(0)
  assign.forEach((a) => counts[a]++)
  return centroids
    .map((c, i) => ({ hex: rgbToHex(c), pct: counts[i] / pixels.length }))
    .filter((c) => c.pct > 0.02)
    .sort((a, b) => b.pct - a.pct)
}

// Pull an ImageData off any loaded <img>/<video>/canvas.
export const imageToData = (source, max = 220) => {
  const w = source.videoWidth || source.naturalWidth || source.width
  const h = source.videoHeight || source.naturalHeight || source.height
  if (!w || !h) return null
  const scale = Math.min(1, max / Math.max(w, h))
  const cw = Math.max(1, Math.round(w * scale))
  const ch = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = cw; canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(source, 0, 0, cw, ch)
  return ctx.getImageData(0, 0, cw, ch)
}

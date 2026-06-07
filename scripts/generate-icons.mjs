// Generates DRIP app icons (PNG) — typographic wordmark only, no logo mark.
// Run: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = resolve(__dirname, '..', 'public')

// size only affects output raster size; artwork is a fixed 512 viewBox.
const wordmark = ({ rounded = true, scale = 1 } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e7e7e2"/>
    </linearGradient>
  </defs>
  ${rounded ? '<rect width="512" height="512" rx="116" fill="#0A0A0B"/>' : '<rect width="512" height="512" fill="#0A0A0B"/>'}
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <text x="256" y="292" font-family="Arial Black, Arial, sans-serif" font-size="150" font-weight="900"
          text-anchor="middle" fill="url(#ink)" letter-spacing="2">DRIP</text>
    <rect x="150" y="324" width="212" height="14" rx="7" fill="#CCFF02"/>
  </g>
</svg>`

const jobs = [
  { name: 'icon-192.png', size: 192, opts: { rounded: true } },
  { name: 'icon-512.png', size: 512, opts: { rounded: true } },
  { name: 'icon-maskable-512.png', size: 512, opts: { rounded: false, scale: 0.7 } },
  { name: 'apple-touch-icon.png', size: 180, opts: { rounded: true } },
  { name: 'icon-1024.png', size: 1024, opts: { rounded: true } },
  { name: 'og-image.png', size: 512, opts: { rounded: false } },
]

for (const j of jobs) {
  const svg = Buffer.from(wordmark(j.opts))
  await sharp(svg, { density: 300 }).resize(j.size, j.size).png().toFile(resolve(pub, j.name))
  console.log('wrote', j.name)
}

writeFileSync(resolve(pub, 'favicon.svg'), wordmark({ rounded: true }))
console.log('wrote favicon.svg')

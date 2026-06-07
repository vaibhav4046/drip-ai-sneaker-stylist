// Stage 3: composite cutouts onto ONE backdrop with UNIFORM scale + baseline. (sharp only)
import sharp from 'sharp'
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cut = resolve(__dirname, '_cut')
const outDir = resolve(__dirname, '..', 'public', 'shoes')
mkdirSync(outDir, { recursive: true })

const S = 1000
const TARGET_W = 700 // every shoe rendered to the same width
const MAX_H = 600 // clamp high-tops
const BASE_Y = 720 // every shoe's bottom sits on this line

const bg = Buffer.from(`
<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f7f8"/>
      <stop offset="1" stop-color="#e7e7ec"/>
    </linearGradient>
    <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="17"/></filter>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#g)"/>
  <ellipse cx="${S / 2}" cy="${BASE_Y + 14}" rx="300" ry="34" fill="#8f8f98" opacity="0.5" filter="url(#b)"/>
</svg>`)

const files = readdirSync(cut).filter((f) => f.endsWith('.png'))
const ok = []
for (const f of files) {
  const id = basename(f, '.png')
  try {
    let buf
    try { buf = await sharp(resolve(cut, f)).trim({ threshold: 12 }).toBuffer() } catch { buf = await sharp(resolve(cut, f)).toBuffer() }
    let meta = await sharp(buf).metadata()
    let scale = TARGET_W / meta.width
    if (meta.height * scale > MAX_H) scale = MAX_H / meta.height
    const nw = Math.round(meta.width * scale)
    const nh = Math.round(meta.height * scale)
    const resized = await sharp(buf).resize(nw, nh).toBuffer()
    const left = Math.round((S - nw) / 2)
    const top = Math.round(BASE_Y - nh)
    await sharp(bg).composite([{ input: resized, left, top }]).webp({ quality: 88 }).toFile(resolve(outDir, `${id}.webp`))
    ok.push(id)
  } catch (e) { console.log('compose fail', id, e.message) }
}
ok.sort()
writeFileSync(resolve(__dirname, '..', 'src', 'data', 'localImages.js'),
  `// AUTO-GENERATED — ids with self-hosted, background-normalized product images.
export const LOCAL_IMAGES = new Set(${JSON.stringify(ok)})
export const localImage = (id) => (LOCAL_IMAGES.has(id) ? \`/shoes/\${id}.webp\` : null)
`)
console.log(`stage3 composed ${ok.length}/${files.length} (uniform width ${TARGET_W}, baseline ${BASE_Y})`)

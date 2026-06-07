// Stage 1: download full (uncropped) originals → scripts/_orig/<id>.png  (sharp only)
import sharp from 'sharp'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const URLS = JSON.parse(readFileSync(resolve(__dirname, 'img-urls.json'), 'utf8'))
const orig = resolve(__dirname, '_orig')
mkdirSync(orig, { recursive: true })

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

async function dl(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: new URL(url).origin + '/', Accept: 'image/*' }, redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

const only = process.argv[2]
const fail = []
let ok = 0
await Promise.all(Object.entries(URLS).filter(([id]) => !only || id === only).map(async ([id, url]) => {
  try {
    const buf = await dl(url)
    await sharp(buf).resize(1100, 1100, { fit: 'inside', withoutEnlargement: true })
      .png().toFile(resolve(orig, `${id}.png`))
    ok++
  } catch (e) { fail.push(`${id}: ${e.message}`) }
}))
console.log(`stage1 downloaded ${ok}/${Object.keys(URLS).length}`)
if (fail.length) console.log('FAIL:\n  ' + fail.join('\n  '))

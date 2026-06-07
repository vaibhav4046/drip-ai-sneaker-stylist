// Stage 2: remove backgrounds  scripts/_orig/<id>.png → scripts/_cut/<id>.png  (imgly only, NO sharp)
import { removeBackground } from '@imgly/background-removal-node'
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const orig = resolve(__dirname, '_orig')
const cut = resolve(__dirname, '_cut')
mkdirSync(cut, { recursive: true })

const only = process.argv[2]
const files = readdirSync(orig).filter((f) => f.endsWith('.png') && (!only || f === `${only}.png`))
let ok = 0
const fail = []
for (const f of files) {
  const id = basename(f, '.png')
  try {
    const blob = await removeBackground(pathToFileURL(resolve(orig, f)).href)
    const out = Buffer.from(await blob.arrayBuffer())
    writeFileSync(resolve(cut, `${id}.png`), out)
    ok++
    process.stdout.write('.')
  } catch (e) { fail.push(`${id}: ${e.message}`) }
}
console.log(`\nstage2 cutout ${ok}/${files.length}`)
if (fail.length) console.log('FAIL:\n  ' + fail.join('\n  '))

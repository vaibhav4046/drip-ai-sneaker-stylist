// Downloads the candidate Unsplash photos and composites a labeled contact sheet
// so we can tag each by color/silhouette and map shoes accurately.
import sharp from 'sharp'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const IDS = [
  '1542291026-7eec264c27ff', '1460353581641-37baddab0fa2', '1606107557195-0e29a4b5b4aa',
  '1595950653106-6c9ebd614d3a', '1600185365926-3a2ce3cdb9eb', '1549298916-b41d501d3772',
  '1539185441755-769473a23570', '1608231387042-66d1773070a5', '1597045566677-8cf032ed6634',
  '1605408499391-6368c628ef42', '1514989940723-e8e51635b782', '1551107696-a4b0c5a0d9a2',
  '1556906781-9a412961c28c', '1525966222134-fcfa99b8ae77', '1491553895911-0055eca6402d',
  '1525874684015-58379d421a52', '1600269452121-4f2416e55c28', '1543508282-6319a3e2621f',
  '1597248881519-db089d3744a5', '1465453869711-7e174808ace9', '1562183241-b937e95585b6',
  '1570464197285-9949814674a7', '1584735175315-9d5df23860e6', '1595341888016-a392ef81b7de',
  '1606890737304-57a1ca8a5b62', '1552346154-21d32810aba3', '1575537302964-96cd47c06b1b',
  '1551489186-cf8726f514f8', '1578116922645-3976907a7671', '1582588678413-dbf45f4823e9',
  '1593081891731-fda0877988da', '1610398752800-146f269dfcc8',
]

const COLS = 6
const CELL = 230
const rows = Math.ceil(IDS.length / COLS)
const W = COLS * CELL
const H = rows * CELL

const composites = []
for (let i = 0; i < IDS.length; i++) {
  const url = `https://images.unsplash.com/photo-${IDS[i]}?w=220&h=220&fit=crop&q=70`
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = await sharp(buf).resize(CELL - 10, CELL - 10).toBuffer()
  const col = i % COLS
  const row = Math.floor(i / COLS)
  composites.push({ input: img, left: col * CELL + 5, top: row * CELL + 5 })
  const label = Buffer.from(
    `<svg width="60" height="28"><rect width="60" height="28" rx="6" fill="#000"/><text x="8" y="20" font-family="Arial" font-size="18" fill="#CCFF02" font-weight="bold">${i + 1}</text></svg>`,
  )
  composites.push({ input: label, left: col * CELL + 8, top: row * CELL + 8 })
}

await sharp({ create: { width: W, height: H, channels: 3, background: '#111' } })
  .composite(composites)
  .jpeg({ quality: 78 })
  .toFile(resolve(__dirname, 'contact-sheet.jpg'))

console.log('wrote contact-sheet.jpg', W, 'x', H)

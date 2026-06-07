// DRIP recommender — content-based feature vectors + a taste profile learned from
// user interactions, with diversity (MMR) and personalized search relevance.
// Runs fully client-side. This is the engagement "algorithm".
import { rgbToHsl, hexToRgb, nameColor } from './color.js'

const CATS = ['lifestyle', 'running', 'basketball', 'skate', 'trail']
const TAGS = ['court', 'retro', 'runner', 'chunky', 'minimal', 'techy', 'skate', 'trail', 'hype', 'classic', 'luxe', 'statement']

const INTERACTION_WEIGHTS = { view: 1, search: 1.5, like: 4, add: 5, wear: 3, dislike: -3 }

// Maps the style-quiz answer to aesthetic tags so the quiz shapes recommendations.
export const STYLE_PREF_TAGS = {
  street: ['hype', 'statement', 'chunky', 'skate'],
  minimal: ['minimal', 'classic', 'court'],
  smart: ['luxe', 'classic', 'minimal'],
}

const styleBias = (shoe, stylePref) => {
  const tags = STYLE_PREF_TAGS[stylePref]
  if (!tags || !shoe.styleTags) return 0
  return shoe.styleTags.filter((t) => tags.includes(t)).length / tags.length
}

// Colorway nicknames so color search works ("white" → Panda, "bred" → black+red, etc.)
const COLORWAY_ALIASES = {
  panda: ['black', 'white'], bred: ['black', 'red'], zebra: ['white', 'black'], unc: ['blue', 'white'],
  chicago: ['red', 'white', 'black'], pollen: ['yellow', 'black'], infrared: ['red', 'grey'], volt: ['green'],
  'sea salt': ['cream', 'beige'], 'shifting sand': ['beige', 'tan'], 'silver bullet': ['silver', 'grey'],
}
const HALF_LIFE_DAYS = 14

// Build a normalized feature vector for a shoe.
const vecCache = new Map()
export function featureVector(shoe) {
  if (vecCache.has(shoe.id)) return vecCache.get(shoe.id)
  const { h, s, l } = rgbToHsl(hexToRgb(shoe.hex))
  const rad = (h / 360) * 2 * Math.PI
  const v = [
    Math.cos(rad) * 0.5 + 0.5, // hue cos  (color weighted ×~2 via duplication below)
    Math.sin(rad) * 0.5 + 0.5, // hue sin
    s, s,                       // saturation (doubled = more weight on color)
    l,
    Math.min(1, shoe.price / 250),
    ...CATS.map((c) => (shoe.category === c ? 1 : 0)),
    ...TAGS.map((t) => (shoe.styleTags?.includes(t) ? 1 : 0)),
  ]
  vecCache.set(shoe.id, v)
  return v
}

export function cosine(a, b) {
  if (!a || !b) return 0
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0
}

// Learn a taste vector from interactions (recency-decayed, action-weighted).
export function tasteProfile(interactions = [], getShoe) {
  if (!interactions.length) return null
  const now = Date.now()
  let acc = null, total = 0
  for (const it of interactions) {
    const shoe = getShoe(it.shoeId)
    if (!shoe) continue
    const base = INTERACTION_WEIGHTS[it.type] ?? 1
    const ageDays = (now - (it.ts || now)) / 86400000
    const decay = Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
    const w = base * decay
    const v = featureVector(shoe)
    if (!acc) acc = new Array(v.length).fill(0)
    for (let i = 0; i < v.length; i++) acc[i] += v[i] * w
    total += Math.abs(w)
  }
  if (!acc || total === 0) return null
  return acc.map((x) => x / total)
}

// Personalized ranking with popularity prior, novelty boost, and MMR diversity.
export function recommend(shoes, profile, { exclude = [], k = 12, diversity = 0.35, seed = 0, stylePref = null } = {}) {
  const ex = new Set(exclude)
  const pool = shoes.filter((s) => !ex.has(s.id))
  const rng = mulberry(seed + 7)
  const scored = pool.map((s) => {
    const v = featureVector(s)
    const rel = profile ? cosine(profile, v) : 0
    const pop = (s.popularity || 50) / 100
    const novelty = s.isNew ? 1 : 0
    const bias = styleBias(s, stylePref) // quiz-driven prior
    const explore = rng() * (profile ? 0.06 : 0.12)
    const score = profile
      ? 0.52 * rel + 0.2 * pop + 0.14 * bias + 0.08 * novelty + explore
      : 0.5 * bias + 0.34 * pop + 0.1 * novelty + explore
    return { shoe: s, v, score }
  }).sort((a, b) => b.score - a.score)

  // MMR for diverse feed
  const picked = []
  const cand = scored.slice(0, Math.min(scored.length, k * 3))
  while (picked.length < Math.min(k, cand.length)) {
    let best = null, bestVal = -Infinity, bestIdx = -1
    for (let i = 0; i < cand.length; i++) {
      const c = cand[i]
      if (!c) continue
      let maxSim = 0
      for (const p of picked) maxSim = Math.max(maxSim, cosine(c.v, p.v))
      const val = (1 - diversity) * c.score - diversity * maxSim
      if (val > bestVal) { bestVal = val; best = c; bestIdx = i }
    }
    if (!best) break
    picked.push(best); cand[bestIdx] = null
  }
  return picked.map((p) => p.shoe)
}

// "More like this"
export function similar(shoe, shoes, k = 6) {
  const v = featureVector(shoe)
  return shoes
    .filter((s) => s.id !== shoe.id)
    .map((s) => ({ s, sim: cosine(v, featureVector(s)) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, k)
    .map((x) => x.s)
}

const COLOR_WORDS = ['black', 'white', 'grey', 'gray', 'cream', 'beige', 'tan', 'brown', 'navy', 'blue', 'green', 'olive', 'red', 'maroon', 'pink', 'purple', 'yellow', 'orange', 'silver']

// Personalized search: text relevance blended with taste profile.
export function searchRank(query, shoes, profile) {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const colorInQuery = COLOR_WORDS.filter((c) => tokens.includes(c))

  const scored = shoes.map((s) => {
    const hay = `${s.brand} ${s.model} ${s.colorway} ${s.category} ${(s.styleTags || []).join(' ')}`.toLowerCase()
    const colorwayLc = s.colorway.toLowerCase()
    const modelLc = s.model.toLowerCase()
    const aliasHits = Object.entries(COLORWAY_ALIASES)
      .filter(([k]) => colorwayLc.includes(k) || modelLc.includes(k))
      .flatMap(([, v]) => v)
    const shoeColors = new Set([nameColor(s.hex).toLowerCase(), ...colorwayLc.split(/[^a-z]+/).filter(Boolean), ...aliasHits])
    let text = 0
    for (const t of tokens) {
      if (hay.includes(t)) text += 2
      if (shoeColors.has(t)) text += 1.5
    }
    for (const c of colorInQuery) { const cc = c === 'gray' ? 'grey' : c; if (shoeColors.has(cc)) text += 2 }
    const rel = profile ? cosine(profile, featureVector(s)) : 0
    const pop = (s.popularity || 50) / 100
    const score = text > 0 ? 0.7 * text + 0.2 * rel + 0.1 * pop : 0
    return { s, score, text }
  })

  const hits = scored.filter((x) => x.text > 0).sort((a, b) => b.score - a.score).map((x) => x.s)
  return hits
}

// Human-readable taste summary for the profile page.
export function tasteSummary(interactions, getShoe) {
  const profile = tasteProfile(interactions, getShoe)
  if (!profile) return null
  const tagStart = 6 + CATS.length
  const tagScores = TAGS.map((t, i) => ({ t, v: profile[tagStart + i] })).sort((a, b) => b.v - a.v)
  const catScores = CATS.map((c, i) => ({ c, v: profile[6 + i] })).sort((a, b) => b.v - a.v)
  const lum = profile[4]
  const sat = profile[2]
  return {
    topTags: tagScores.slice(0, 3).map((x) => x.t),
    topCategory: catScores[0].c,
    tone: lum > 0.6 ? 'light tones' : lum < 0.35 ? 'dark tones' : 'balanced tones',
    color: sat > 0.4 ? 'bold color' : sat < 0.18 ? 'neutral' : 'muted color',
  }
}

// deterministic PRNG so feeds are stable within a session/seed
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Date-seeded "drop of the day" — rotates daily, refreshes content over time.
export function dropOfTheDay(shoes, dateStr) {
  let h = 0
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0
  return shoes[h % shoes.length]
}

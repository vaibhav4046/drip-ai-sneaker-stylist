// Rule-based outfit engine: color theory + occasion + weather + gender/modest.
import { TOPS, BOTTOMS, LAYERS, ACCESSORIES } from '../data/outfits.js'
import { getOccasion } from '../data/occasions.js'
import { rgbToHsl, hexToRgb, luminance, colorTemp, harmony, contrast } from './color.js'
import { warmthNeed, isWet } from './weather.js'

const hueDist = (a, b) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// 0..1 — how well a clothing color sits with the shoe color.
function colorScore(pieceHex, shoe) {
  const shoeHsl = rgbToHsl(hexToRgb(shoe.hex))
  const pHsl = rgbToHsl(hexToRgb(pieceHex))
  const shoeNeutral = shoeHsl.s < 0.14
  const pieceNeutral = pHsl.s < 0.14

  if (shoeNeutral) {
    // neutral shoe pairs with anything; lightly reward a controlled pop of color
    if (pieceNeutral) return 0.8
    return pHsl.s <= 0.6 ? 0.9 : 0.7
  }
  // colorful shoe: keep the rest mostly neutral OR harmonize
  if (pieceNeutral) return 0.92
  const h = harmony(shoe.hex)
  const targets = [h.complementary, ...h.analogous, ...h.triadic].map((x) => rgbToHsl(hexToRgb(x)).h)
  const nearest = Math.min(...targets.map((t) => hueDist(pHsl.h, t)))
  return Math.max(0.35, 0.9 - nearest / 90) // closer to a harmony hue = better
}

function genderPool(pool, gender, modest) {
  return pool.filter((p) => {
    // modest: cultural/unisex pieces only, and never revealing (no shorts/tanks/crops)
    if (modest) return (p.gender === 'modest' || p.gender === 'unisex') && !/short|tank|crop|bike/.test(p.id)
    if (gender === 'female') return p.gender === 'female' || p.gender === 'unisex'
    if (gender === 'male') return p.gender === 'male' || p.gender === 'unisex' || p.gender === undefined
    return true // unisex view shows all
  })
}

function scorePiece(piece, { shoe, occasion, targetFormality, warmth, stylePref, isTop }) {
  let s = 0
  // formality closeness (max 3 pts)
  s += 3 - Math.min(3, Math.abs((piece.formality ?? 2) - targetFormality))
  // occasion tag overlap (max ~2 pts)
  const overlap = (piece.tags || []).filter((t) => occasion.prefer.includes(t)).length
  s += Math.min(2, overlap * 1.1)
  // color harmony (max 3 pts)
  s += colorScore(piece.hex, shoe) * 3
  // warmth match for tops/layers (max 1.5)
  if (piece.warmth !== undefined) s += 1.5 - Math.min(1.5, Math.abs(piece.warmth - warmth) * 0.8)
  // contrast: dark shoe wants a lighter top
  if (isTop) {
    const shoeLum = luminance(shoe.hex)
    const pieceLum = luminance(piece.hex)
    if (shoeLum < 0.25 && pieceLum > 0.4) s += 0.8
    if (shoeLum > 0.7 && pieceLum < 0.5) s += 0.4
  }
  // style preference nudge
  if (stylePref === 'street' && (piece.tags || []).includes('street')) s += 0.6
  if (stylePref === 'minimal' && (piece.tags || []).includes('minimal')) s += 0.6
  if (stylePref === 'smart' && (piece.tags || []).includes('smart')) s += 0.6
  return s
}

function pick(pool, ctx, variant = 0) {
  const ranked = pool
    .map((p) => ({ p, s: scorePiece(p, ctx) }))
    .sort((a, b) => b.s - a.s)
  if (!ranked.length) return null
  // variant rotates through the top candidates for the shuffle feature
  const topN = ranked.slice(0, Math.min(4, ranked.length))
  return topN[variant % topN.length].p
}

function buildDontWear(shoe, occasion) {
  const temp = colorTemp(shoe.hex)
  const lum = luminance(shoe.hex)
  const out = []
  const h = harmony(shoe.hex)
  const shoeName = `the ${shoe.colorway} ${shoe.model}`
  if (rgbToHsl(hexToRgb(shoe.hex)).s > 0.35) {
    out.push(`Another loud color — let ${shoeName} be the statement.`)
  } else {
    out.push(`All-flat tones head to toe — add one piece with texture or depth.`)
  }
  if (lum < 0.3) out.push('Heavy all-black up top — break it with a lighter layer or tee.')
  else out.push('Muddy earth tones that fight the clean upper.')
  if (temp === 'warm') out.push('Icy cool-blue bottoms — they clash with the warm undertone.')
  else if (temp === 'cool') out.push('Orange/rust pieces — they fight the cool undertone.')
  else out.push('Over-accessorising — keep it to one or two pieces.')
  if (occasion.formality >= 4) out.push('Distressed denim or graphics — too casual for this.')
  return out.slice(0, 3)
}

/**
 * Generate a complete outfit.
 * @returns {top, bottom, layer|null, accessory|null, dontWear[], palette[], rationale, needLayer}
 */
export function generateOutfit({ shoe, occasionId, gender = 'unisex', stylePref = 'minimal', weather, ownedAccessoryIds = [], variant = 0 }) {
  const occasion = getOccasion(occasionId)
  const modest = !!occasion.modest || gender === 'modest'
  const warmth = warmthNeed(weather?.temp ?? 18)
  const targetFormality = occasion.formality

  const baseCtx = { shoe, occasion, targetFormality, warmth, stylePref }

  const top = pick(genderPool(TOPS, gender, modest), { ...baseCtx, isTop: true }, variant)
  const bottom = pick(genderPool(BOTTOMS, gender, modest), baseCtx, variant)

  const needLayer = (weather?.temp ?? 18) < 18 || warmth >= 1 || isWet(weather?.code)
  const layer = needLayer ? pick(genderPool(LAYERS, gender, modest), { ...baseCtx, warmth: Math.max(1, warmth) }, variant) : null

  // accessory: prefer one the user owns, else best suggestion
  const accPool = genderPool(ACCESSORIES, gender, modest)
  // prefer an owned accessory only if it fits the occasion's formality; else best-scored
  const owned = accPool.filter((a) => ownedAccessoryIds.includes(a.id) && Math.abs((a.formality ?? 2) - targetFormality) <= 1)
  const accessory = (owned.length ? pick(owned, baseCtx, variant) : pick(accPool, baseCtx, variant)) || null

  const palette = [shoe.hex, top?.hex, bottom?.hex, layer?.hex].filter(Boolean)

  const tempStr = weather ? `${weather.temp}°C ${weather.condition.toLowerCase()}` : 'mild weather'
  const rationale =
    `For ${occasion.label.toLowerCase()} in ${tempStr}, this leans on ${colorTemp(shoe.hex)} tones from your ${shoe.model}. ` +
    (luminance(shoe.hex) < 0.3
      ? 'A lighter top lifts the dark upper for contrast.'
      : 'Neutral layers keep the shoe as the hero.')

  return {
    top, bottom, layer, accessory,
    needLayer,
    palette,
    rationale,
    dontWear: buildDontWear(shoe, occasion),
    occasion,
  }
}

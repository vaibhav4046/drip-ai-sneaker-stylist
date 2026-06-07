// Lightweight rule-based stylist chat. Parses intent, returns reply + optional action.
// (Production swaps this for an LLM via OpenRouter — see master spec.)
import { OCCASIONS } from '../data/occasions.js'
import { convert } from '../data/currencies.js'
import { SHOES } from '../data/shoes.js'

const STYLE_WORDS = {
  street: ['street', 'streetwear', 'baggy', 'hype', 'casual fit'],
  minimal: ['minimal', 'clean', 'simple', 'plain'],
  smart: ['smart', 'formal', 'dressy', 'sharp', 'business'],
}

const OCCASION_HINTS = {
  wedding: ['wedding', 'marriage', 'reception'],
  date: ['date', 'dinner', 'romantic'],
  work: ['work', 'office', 'meeting', 'interview'],
  gym: ['gym', 'workout', 'training', 'run'],
  party: ['party', 'club', 'night out'],
  festival: ['festival', 'concert', 'rave', 'gig'],
  prayer: ['prayer', 'mosque', 'eid', 'namaz', 'temple', 'church'],
  travel: ['travel', 'flight', 'airport', 'trip'],
  outdoor: ['outdoor', 'hike', 'hiking', 'trail'],
  proposal: ['propose', 'proposal', 'engagement'],
  movies: ['movie', 'cinema', 'film'],
  casual: ['casual', 'everyday', 'chill', 'hang'],
}

const detect = (text, table) => {
  const t = text.toLowerCase()
  for (const [key, words] of Object.entries(table)) {
    if (words.some((w) => t.includes(w))) return key
  }
  return null
}

const num = (text) => {
  const m = text.replace(/,/g, '').match(/(\d{2,5})/)
  return m ? parseInt(m[1], 10) : null
}

/**
 * @param {string} text user message
 * @param {object} ctx { closet, weather, gender, stylePref, currency }
 * @returns {{ text, action? }} action: {type:'recommend', occasionId} | {type:'setStyle', value} | {type:'budget', max} | {type:'scan'} | {type:'goCloset'}
 */
export function respond(text, ctx = {}) {
  const t = text.toLowerCase().trim()
  const closet = ctx.closet || []
  const firstShoe = closet[0]

  if (!t) return { text: "Say something like 'what should I wear to a date?'" }

  if (/^(hi|hey|hello|yo|sup|wassup)\b/.test(t)) {
    return { text: `Hey — I'm DRIP. Tell me where you're headed and I'll build a fit around your kicks. Try "what should I wear to work?"` }
  }

  if (t.includes('help') || t.includes('what can you')) {
    return { text: 'I can: build outfits for any occasion, filter by budget, switch your style vibe, and rate a fit. Try "style me for a party" or "show me something under 80".' }
  }

  // style override
  const style = detect(t, STYLE_WORDS)
  if (style && (t.includes('feel') || t.includes('vibe') || t.includes('mode') || t.includes('today') || t.includes('go '))) {
    return { text: `Locked in ${style} mode. I'll bias your fits that way.`, action: { type: 'setStyle', value: style } }
  }

  // budget
  if (t.includes('under') || t.includes('budget') || t.includes('cheap') || t.includes('less than')) {
    const max = num(t)
    if (max) return { text: `Filtering the shop to under ${convert(max, ctx.currency || 'USD')}.`, action: { type: 'budget', max } }
  }

  // rate / scan
  if (t.includes('rate') || t.includes('verdict') || t.includes('score my')) {
    return { text: 'Open the scanner and snap your full fit — I\'ll score the color balance.', action: { type: 'scan' } }
  }
  if (t.includes('scan') || t.includes('add my') || t.includes('add a shoe')) {
    return { text: 'Camera time. Point at your sneaker and I\'ll pull the colors.', action: { type: 'scan' } }
  }

  // recommend by occasion
  const occ = detect(t, OCCASION_HINTS)
  if (occ || t.includes('wear') || t.includes('outfit') || t.includes('style me') || t.includes('fit')) {
    const occasionId = occ || 'casual'
    const o = OCCASIONS.find((x) => x.id === occasionId)
    if (!firstShoe) {
      return { text: `Add a sneaker to your closet first and I'll style a ${o.label.toLowerCase()} fit around it.`, action: { type: 'goCloset' } }
    }
    // resolve which sneaker the user mentioned — search closet first, then the full catalog
    const matchShoe = (pool, min) => {
      let best = null, bc = 0
      for (const s of pool) {
        const words = `${s.brand} ${s.model} ${s.colorway}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2)
        const c = words.filter((w) => t.includes(w)).length
        if (c >= min && c > bc) { bc = c; best = s }
      }
      return best
    }
    const matched = matchShoe(closet, 1) || matchShoe(SHOES, 2) || firstShoe
    return {
      text: `On it — a ${o.label.toLowerCase()} fit built around your ${matched.colorway} ${matched.model}. ${o.blurb}`,
      action: { type: 'recommend', occasionId, shoeId: matched.id },
    }
  }

  // fallback
  return {
    text: `I can style you for anything — date, work, gym, wedding, festival, prayer, travel and more. Where are you headed?`,
  }
}

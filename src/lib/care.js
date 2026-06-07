// Honest "should you wear this shoe today?" — material vs weather.
// Suede/nubuck get destroyed by water; canvas/leather suffer; mesh/knit/synthetic shrug it off.
import { isWet } from './weather.js'

export function materialRainRisk(material = '') {
  const m = material.toLowerCase()
  if (/suede|nubuck/.test(m)) return 'high'
  if (/canvas|leather/.test(m)) return 'medium'
  return 'low' // mesh, knit, primeknit, synthetic, rubber
}

const wetOut = (weather) =>
  !!weather && (isWet(weather.code) || /rain|drizzle|snow|shower|thunder|sleet|wet/i.test(weather.condition || ''))

// Returns { level, msg } or null. Honest, protective — not a hype-man.
export function careAdvice(shoe, weather) {
  if (!shoe || !weather) return null
  const material = shoe.material || ''
  const risk = materialRainRisk(material)
  const wet = wetOut(weather)
  const cond = (weather.condition || 'rain').toLowerCase()

  if (wet && risk === 'high') {
    return { level: 'high', wear: false, msg: `Don't wear these today — ${material} + ${cond} will stain and warp the suede. Save them and grab a mesh or synthetic pair.` }
  }
  if (wet && risk === 'medium') {
    return { level: 'medium', wear: true, msg: `${weather.condition} out — protect the ${material}: water-repellent spray, or pick a weatherproof pair if it's pouring.` }
  }
  if ((weather.temp ?? 20) <= 1 && /knit|mesh/.test(material.toLowerCase())) {
    return { level: 'medium', wear: true, msg: `Freezing + breathable ${material} — feet will be cold. Thermal socks, or go for something insulated.` }
  }
  return null
}

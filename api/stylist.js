// Real-AI stylist. Providers tried in order of which key is set:
//   NVIDIA NIM → OpenRouter → HuggingFace  (NVIDIA first: fastest + most reliable).
// Each call is time-boxed so a slow provider falls through instead of hanging.
export const config = { maxDuration: 30 }

function buildSystem(context = {}) {
  const { closet = [], weather = {}, gender = 'unisex', stylePref = 'minimal', currency = 'USD', taste = [], outfit = null, market = null, verdict = null } = context
  if (verdict) {
    return `You are DRIP, a sharp sneaker stylist judging a photographed outfit. Detected dominant colors: ${(verdict.colors || []).join(', ') || 'unknown'}. Their sneaker reads as: ${verdict.shoe || 'unknown'}. In exactly 2 natural, confident sentences, say whether the palette works (use real color theory — contrast, harmony, neutrals) and give ONE specific, actionable tip. Conversational, no markdown, no lists, no score numbers.`
  }
  const closetStr = closet.slice(0, 12).map((s) => `${s.colorway} ${s.brand} ${s.model}`).join('; ') || 'empty'
  const tasteStr = (taste || []).join(', ') || stylePref
  let base = `You are DRIP, an elite sneaker stylist. Be concise (2-3 sentences), confident, specific, on-trend. Plain text, no markdown.
User: gender=${gender}; style=${stylePref}; taste=${tasteStr}; weather=${weather.temp ?? '?'}°C ${weather.condition ?? ''}; season=${weather.season ?? '?'}; currency=${currency}.
Closet: ${closetStr}.
HONESTY RULE (most important): Be accurate, NOT a hype-man. If a shoe does not suit today's weather or occasion, clearly tell them NOT to wear that pair and say why, then suggest a better alternative. Suede, nubuck, and canvas are RUINED by rain/snow — never recommend wearing them in wet weather; leather also suffers when soaked. Protecting their kicks and giving honest, useful advice beats hyping every choice. It is good to say "don't wear these today."`
  if (outfit?.material) base += `\nThe shoe's upper is ${outfit.material}.`
  if (context.care) base += `\nWeather-care flag for this shoe today: ${context.care}`
  if (outfit) {
    base += `\nDRIP just generated this exact fit: shoe=${outfit.shoe}; top=${outfit.top || '-'}; bottom=${outfit.bottom || '-'}; layer=${outfit.layer || '-'}; for ${outfit.occasion}.`
    if (market?.avgPrice) base += ` (Shoe live resale ≈ $${market.avgPrice} USD.)`
    base += `\nComment ONLY on these exact pieces — do NOT propose different garments. In 2 sentences say why this fit works (color/proportion), then ONE short "don't" tip using these pieces.`
  } else {
    base += `\nAnswer their styling question directly and specifically, using real color theory. If they ask for an occasion, name a top, bottom, optional layer, and one "don't wear" tip.`
  }
  return base
}

function withTimeout(ms) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return { signal: c.signal, done: () => clearTimeout(t) }
}

async function openai(url, key, model, system, message, history = [], extraHeaders = {}) {
  const to = withTimeout(7000)
  try {
    const r = await fetch(url, {
      method: 'POST', signal: to.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: message }], max_tokens: 300, temperature: 0.75 }),
    })
    if (!r.ok) throw new Error(`${r.status}`)
    const d = await r.json()
    const text = d.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('empty')
    return text
  } finally { to.done() }
}

async function huggingface(key, system, message, history = []) {
  const model = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3'
  const to = withTimeout(7000)
  const hist = history.map((h) => `${h.role === 'user' ? 'User' : 'DRIP'}: ${h.content}`).join('\n')
  try {
    const r = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST', signal: to.signal,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: `<s>[INST] ${system}\n${hist}\n\nUser: ${message} [/INST]`, parameters: { max_new_tokens: 280, temperature: 0.75, return_full_text: false } }),
    })
    if (!r.ok) throw new Error(`${r.status}`)
    const d = await r.json()
    const text = (Array.isArray(d) ? d[0]?.generated_text : d?.generated_text)?.trim()
    if (!text) throw new Error('empty')
    return text
  } finally { to.done() }
}

// best-effort per-instance rate limit (guards quota against casual abuse)
const HITS = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const recent = (HITS.get(ip) || []).filter((t) => now - t < 60000)
  recent.push(now)
  HITS.set(ip, recent)
  if (HITS.size > 500) for (const [k, v] of HITS) if (!v.some((t) => now - t < 60000)) HITS.delete(k)
  return recent.length > 20
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'anon'
  if (rateLimited(ip)) { res.status(429).json({ fallback: true, reason: 'rate_limited' }); return }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { message = '', context = {} } = body || {}
  if (!message.trim()) { res.status(400).json({ error: 'empty message' }); return }

  // multi-turn memory: sanitized recent turns
  const history = (Array.isArray(context.history) ? context.history : [])
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string' && h.content.trim())
    .slice(-6)
    .map((h) => ({ role: h.role, content: h.content.slice(0, 500) }))

  if (!process.env.NVIDIA_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.HF_API_KEY) { res.status(200).json({ fallback: true, reason: 'no_key' }); return }

  // generic multi-provider caller: NVIDIA → OpenRouter → HuggingFace, first that works
  async function callBest(sys, msg, hist = []) {
    if (process.env.NVIDIA_API_KEY) { try { return [await openai('https://integrate.api.nvidia.com/v1/chat/completions', process.env.NVIDIA_API_KEY, process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct', sys, msg, hist), 'NVIDIA'] } catch { /* next */ } }
    if (process.env.OPENROUTER_API_KEY) { try { return [await openai('https://openrouter.ai/api/v1/chat/completions', process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free', sys, msg, hist, { 'HTTP-Referer': 'https://drip-two-rho.vercel.app', 'X-Title': 'DRIP' }), 'OpenRouter'] } catch { /* next */ } }
    if (process.env.HF_API_KEY) { try { return [await huggingface(process.env.HF_API_KEY, sys, msg, hist), 'HuggingFace'] } catch { /* next */ } }
    return [null, null]
  }

  const system = buildSystem(context)
  const [draft, provider] = await callBest(system, message, history)
  if (!draft) { res.status(200).json({ fallback: true, reason: 'all_providers_failed' }); return }

  // multi-agent: a critic agent reviews & sharpens the stylist's take on a specific fit
  let final = draft, agents = 1
  if (context.outfit) {
    const o = context.outfit
    const criticSys = `You are a senior fashion critic. A junior stylist proposed this fit and wrote a take. Fit: shoe=${o.shoe}; top=${o.top || '-'}; bottom=${o.bottom || '-'}; layer=${o.layer || '-'} for ${o.occasion}. Junior's take: "${draft}". Rewrite it sharper in 2-3 sentences: fix any color-theory errors, stay specific to THESE exact pieces, and end with one concrete "don't" tip. Plain text only, no preamble.`
    const [crit] = await callBest(criticSys, 'Refine the take.')
    if (crit) { final = crit; agents = 2 }
  }
  res.status(200).json({ text: final, provider, agents })
}

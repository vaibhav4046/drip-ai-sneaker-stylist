/**
 * DRIP TasteBridge: minimal server-only Qloo Insights gateway.
 * Guide: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
 * Qloo key is NEVER returned to the browser or committed to Git.
 */
const BASE = 'https://hackathon.api.qloo.com';
const TYPES = new Set([
  'urn:entity:brand', 'urn:entity:artist', 'urn:entity:destination',
  'urn:entity:place', 'urn:entity:movie', 'urn:entity:book',
]);

export async function tasteHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const key = process.env.QLOO_API_KEY;
  if (!key) return res.status(503).json({ error: 'qloo_not_configured' });

  const seed = Array.isArray(req.query?.seed) ? '' : String(req.query?.seed ?? '').trim();
  const target = Array.isArray(req.query?.type) ? '' : String(req.query?.type ?? 'urn:entity:brand');
  if (!/^[a-zA-Z0-9_:.\-]{3,160}$/.test(seed) || !TYPES.has(target)) {
    return res.status(400).json({ error: 'invalid_qloo_entity_or_type' });
  }

  const params = new URLSearchParams({
    'filter.type': target,
    'signal.interests.entities': seed,
  });
  let upstream;
  try {
    upstream = await fetch(`${BASE}/v2/insights?${params.toString()}`, {
      method: 'GET',
      headers: { 'X-Api-Key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    return res.status(502).json({ error: 'qloo_unavailable' });
  }
  if (upstream.status === 429) return res.status(429).json({ error: 'qloo_rate_limited' });
  if (!upstream.ok) return res.status(502).json({ error: 'qloo_upstream_error' });

  let payload;
  try {
    payload = await upstream.json();
  } catch {
    return res.status(502).json({ error: 'qloo_invalid_response' });
  }
  const entities = payload?.results?.entities ?? payload?.entities;
  if (!Array.isArray(entities)) return res.status(502).json({ error: 'qloo_unexpected_schema' });
  const candidates = entities.slice(0, 12).map(entity => ({
    id: String(entity?.entity_id ?? entity?.id ?? ''),
    name: String(entity?.name ?? ''),
    type: String(entity?.type ?? target),
  })).filter(e => e.id && e.name);
  return res.status(200).json({
    source: 'qloo_live',
    input: { seedEntity: seed, targetType: target },
    candidates,
    // These are cultural-affinity suggestions, NOT proof of merchant stock/price.
    pricingVerified: false,
  });
}

export default tasteHandler;

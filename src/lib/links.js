// Real shopping + community search links (no API needed).
const enc = (s) => encodeURIComponent(s)

export const shopLinks = (query) => [
  { label: 'Google', url: `https://www.google.com/search?tbm=shop&q=${enc(query)}` },
  { label: 'Amazon', url: `https://www.amazon.com/s?k=${enc(query)}` },
  { label: 'StockX', url: `https://stockx.com/search?s=${enc(query)}` },
]

export const reviewLinks = (query) => [
  { label: 'YouTube', url: `https://www.youtube.com/results?search_query=${enc(query + ' review on feet')}` },
  { label: 'Reddit', url: `https://www.reddit.com/search/?q=${enc(query)}` },
]

// Static approximate FX vs USD. For production, swap to a live rates API.
export const CURRENCIES = {
  USD: { symbol: '$', rate: 1, label: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, label: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, label: 'British Pound' },
  INR: { symbol: '₹', rate: 83.2, label: 'Indian Rupee' },
  AED: { symbol: 'AED ', rate: 3.67, label: 'UAE Dirham' },
  JPY: { symbol: '¥', rate: 156, label: 'Japanese Yen' },
}

export const convert = (usd, code) => {
  const c = CURRENCIES[code] || CURRENCIES.USD
  return `${c.symbol}${Math.round(usd * c.rate).toLocaleString()}`
}

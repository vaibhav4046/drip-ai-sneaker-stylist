// Open-Meteo weather (free, no API key).

const CODES = {
  0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
  85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
}

export const conditionFor = (code) => CODES[code] || 'Unknown'

export const seasonFor = (lat = 0, date = new Date()) => {
  const m = date.getMonth() // 0-11
  const north = lat >= 0
  const map = north
    ? ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter']
    : ['Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter', 'Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer']
  return map[m]
}

export const geolocate = () =>
  new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 1000 * 60 * 30 },
    )
  })

export const fetchWeather = async ({ lat, lon }) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather fetch failed')
  const j = await res.json()
  const c = j.current
  return {
    temp: Math.round(c.temperature_2m),
    code: c.weather_code,
    condition: conditionFor(c.weather_code),
    isDay: !!c.is_day,
    season: seasonFor(lat),
    lat, lon,
  }
}

// Default weather when location is unavailable.
export const DEFAULT_WEATHER = {
  temp: 18, code: 2, condition: 'Partly cloudy', isDay: true, season: seasonFor(20), lat: null, lon: null,
}

export const warmthNeed = (temp) => {
  if (temp <= 7) return 3
  if (temp <= 14) return 2
  if (temp <= 18) return 1
  return 0
}

export const isWet = (code) => [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)

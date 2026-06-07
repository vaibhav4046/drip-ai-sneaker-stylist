import { useState, useEffect, useCallback } from 'react'
import { useStore } from './store/useStore.js'
import { geolocate, fetchWeather, DEFAULT_WEATHER } from './lib/weather.js'
import { TabBar } from './components/TabBar.jsx'
import { Toast } from './components/Toast.jsx'
import { Icon } from './components/Icon.jsx'
import { Home } from './pages/Home.jsx'
import { Scan } from './pages/Scan.jsx'
import { Closet } from './pages/Closet.jsx'
import { Stylist } from './pages/Stylist.jsx'
import { Profile } from './pages/Profile.jsx'

export default function App() {
  const { weather, setWeather, checkIn } = useStore()
  const [tab, setTab] = useState('home')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!weather) setWeather(DEFAULT_WEATHER)
    checkIn()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshWeather = useCallback(async () => {
    setLocating(true)
    try {
      const coords = await geolocate()
      setWeather(coords ? await fetchWeather(coords) : DEFAULT_WEATHER)
    } catch { setWeather(DEFAULT_WEATHER) } finally { setLocating(false) }
  }, [setWeather])

  const navigate = (t) => setTab(t)

  return (
    <div className="mx-auto min-h-[100dvh] max-w-md px-4" style={{ paddingTop: 'calc(14px + var(--safe-top))', paddingBottom: '100px' }}>
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-baseline gap-0.5">
          <span className="display text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>DRIP</span>
          <span className="mb-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--volt)' }} />
        </div>
        <button onClick={refreshWeather} className="chip text-xs" disabled={locating}>
          <Icon name={locating ? 'RefreshCw' : 'MapPin'} size={13} className={locating ? 'spin' : ''} />
          {locating ? 'Locating…' : weather?.lat ? `${weather.temp}°C` : 'Weather'}
        </button>
      </header>

      {tab === 'home' && <Home onRefreshWeather={refreshWeather} onNavigate={navigate} />}
      {tab === 'closet' && <Closet onRefreshWeather={refreshWeather} />}
      {tab === 'scan' && <Scan onRefreshWeather={refreshWeather} />}
      {tab === 'stylist' && <Stylist onNavigate={navigate} />}
      {tab === 'profile' && <Profile />}

      <Toast />
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

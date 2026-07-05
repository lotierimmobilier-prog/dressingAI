import { useEffect, useState } from 'react'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const CONDITION_EMOJI = {
  Clear: '☀️',
  Clouds: '⛅',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
}

const DEMO_WEATHER = {
  temp: 24,
  condition: 'Clear',
  emoji: '☀️',
  ville: 'Paris',
  description: 'ciel dégagé',
  demo: true,
}

/**
 * Récupère la météo géolocalisée via OpenWeatherMap.
 * Fallback démo si pas de clé ou géoloc refusée.
 */
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchByCoords(lat, lon) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('weather error')
      const data = await res.json()
      const main = data.weather?.[0]?.main
      return {
        temp: Math.round(data.main.temp),
        condition: main,
        emoji: CONDITION_EMOJI[main] || '🌤️',
        ville: data.name,
        description: data.weather?.[0]?.description || '',
      }
    }

    function done(w) {
      if (!cancelled) {
        setWeather(w)
        setLoading(false)
      }
    }

    if (!API_KEY || !navigator.geolocation) {
      done(DEMO_WEATHER)
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          done(await fetchByCoords(pos.coords.latitude, pos.coords.longitude))
        } catch {
          done(DEMO_WEATHER)
        }
      },
      () => done(DEMO_WEATHER),
      { timeout: 8000 },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { weather, loading }
}

/** Prévisions 7 jours (démo générative si pas de clé). */
export function useForecast() {
  const [days, setDays] = useState([])
  useEffect(() => {
    const base = ['☀️', '⛅', '🌧️', '☀️', '⛅', '❄️', '☀️']
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const temps = [24, 22, 18, 25, 21, 8, 26]
    setDays(
      labels.map((jour, i) => ({
        jour,
        emoji: base[i],
        temp: temps[i],
        condition: base[i] === '🌧️' ? 'Pluie' : base[i] === '❄️' ? 'Froid' : 'Dégagé',
      })),
    )
  }, [])
  return days
}

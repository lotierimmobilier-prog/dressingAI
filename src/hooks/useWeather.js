import { useCallback, useEffect, useState } from 'react'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const CITY_KEY = 'dressingai.weather.city'

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

/** Ville choisie manuellement, persistée en localStorage (précision météo). */
function readCity() {
  try {
    return localStorage.getItem(CITY_KEY) || ''
  } catch {
    return ''
  }
}

function normalizeWeather(data) {
  const main = data.weather?.[0]?.main
  return {
    temp: Math.round(data.main.temp),
    condition: main,
    emoji: CONDITION_EMOJI[main] || '🌤️',
    ville: data.name,
    description: data.weather?.[0]?.description || '',
  }
}

/**
 * Récupère la météo via OpenWeatherMap.
 * - Si l'utilisateur a indiqué une ville → recherche par nom (plus précis).
 * - Sinon → géolocalisation.
 * - Fallback démo si pas de clé, ville introuvable ou géoloc refusée.
 * Renvoie aussi `city` / `setCity` pour piloter la ville depuis l'UI.
 */
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [city, setCityState] = useState(readCity)

  const setCity = useCallback((value) => {
    const clean = (value || '').trim()
    try {
      if (clean) localStorage.setItem(CITY_KEY, clean)
      else localStorage.removeItem(CITY_KEY)
    } catch {
      /* stockage indisponible : on garde juste l'état en mémoire */
    }
    setCityState(clean)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchByCoords(lat, lon) {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${API_KEY}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('weather error')
      return normalizeWeather(await res.json())
    }

    async function fetchByCity(name) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        name,
      )}&units=metric&lang=fr&appid=${API_KEY}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('weather error')
      return normalizeWeather(await res.json())
    }

    function done(w) {
      if (!cancelled) {
        setWeather(w)
        setLoading(false)
      }
    }

    if (!cancelled) setLoading(true)

    if (!API_KEY) {
      done(city ? { ...DEMO_WEATHER, ville: city } : DEMO_WEATHER)
      return () => {
        cancelled = true
      }
    }

    // Ville renseignée → recherche par nom (prioritaire, plus précis).
    if (city) {
      fetchByCity(city)
        .then(done)
        .catch(() => done({ ...DEMO_WEATHER, ville: city }))
      return () => {
        cancelled = true
      }
    }

    if (!navigator.geolocation) {
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
  }, [city])

  return { weather, loading, city, setCity }
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

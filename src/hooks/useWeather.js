import { useCallback, useEffect, useState } from 'react'

const CITY_KEY = 'dressingai.weather.city'

const DEMO_WEATHER = {
  temp: 24,
  condition: 'Clear',
  emoji: '☀️',
  ville: 'Paris',
  description: 'ciel dégagé',
  demo: true,
}

/** Codes météo WMO (Open-Meteo) → emoji + libellé FR. */
function fromWmo(code) {
  const c = Number(code)
  if (c === 0) return { emoji: '☀️', condition: 'Clear', description: 'ciel dégagé' }
  if (c === 1) return { emoji: '🌤️', condition: 'Clear', description: 'peu nuageux' }
  if (c === 2) return { emoji: '⛅', condition: 'Clouds', description: 'partiellement nuageux' }
  if (c === 3) return { emoji: '☁️', condition: 'Clouds', description: 'couvert' }
  if (c === 45 || c === 48) return { emoji: '🌫️', condition: 'Fog', description: 'brouillard' }
  if (c >= 51 && c <= 57) return { emoji: '🌦️', condition: 'Drizzle', description: 'bruine' }
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82))
    return { emoji: '🌧️', condition: 'Rain', description: 'pluie' }
  if ((c >= 71 && c <= 77) || c === 85 || c === 86)
    return { emoji: '❄️', condition: 'Snow', description: 'neige' }
  if (c >= 95) return { emoji: '⛈️', condition: 'Thunderstorm', description: 'orage' }
  return { emoji: '🌤️', condition: 'Clouds', description: '' }
}

/** Ville choisie manuellement, persistée en localStorage (précision météo). */
function readCity() {
  try {
    return localStorage.getItem(CITY_KEY) || ''
  } catch {
    return ''
  }
}

// Open-Meteo : API météo gratuite et sans clé.
async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name,
  )}&count=1&language=fr&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('geo error')
  const data = await res.json()
  const hit = data.results?.[0]
  if (!hit) throw new Error('city not found')
  return { lat: hit.latitude, lon: hit.longitude, ville: hit.name }
}

async function fetchWeather(lat, lon, ville) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather error')
  const data = await res.json()
  const cur = data.current
  const w = fromWmo(cur.weather_code)
  return {
    temp: Math.round(cur.temperature_2m),
    condition: w.condition,
    emoji: w.emoji,
    description: w.description,
    ville: ville || 'Ma position',
  }
}

// Nom de ville depuis des coordonnées (géoloc) — service gratuit sans clé.
async function reverseCity(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,
    )
    if (!res.ok) return 'Ma position'
    const d = await res.json()
    return d.city || d.locality || d.principalSubdivision || 'Ma position'
  } catch {
    return 'Ma position'
  }
}

/**
 * Récupère la météo réelle via Open-Meteo (gratuit, sans clé API).
 * - Si l'utilisateur a indiqué une ville → géocodage + météo de cette ville.
 * - Sinon → géolocalisation.
 * - Fallback démo si tout échoue (hors-ligne).
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

    function done(w) {
      if (!cancelled) {
        setWeather(w)
        setLoading(false)
      }
    }

    if (!cancelled) setLoading(true)

    // Ville renseignée → météo de cette ville (prioritaire, plus précis).
    if (city) {
      geocodeCity(city)
        .then((g) => fetchWeather(g.lat, g.lon, g.ville))
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
        const { latitude, longitude } = pos.coords
        try {
          const ville = await reverseCity(latitude, longitude)
          done(await fetchWeather(latitude, longitude, ville))
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

/** Prévisions 7 jours (démo générative). */
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

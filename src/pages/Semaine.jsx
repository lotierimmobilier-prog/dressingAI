import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import { useForecast } from '../hooks/useWeather'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { generateOutfits } from '../lib/outfitEngine'
import { tileGradient, readableText } from '../lib/colors'
import { CATEGORIES } from '../lib/constants'

// Associe une condition météo à une humeur/style de tenue.
const WEATHER_MOOD = {
  Froid: 'zen',
  Pluie: 'pro',
  Dégagé: 'decontracte',
}

function MiniPiece({ id }) {
  const item = useWardrobeStore((s) => s.byId(id))
  if (!item) return null
  const cat = CATEGORIES.find((c) => c.id === item.categorie)
  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10"
      style={{ background: tileGradient(item.couleur_hex || '#888') }}
      title={item.nom}
    >
      {item.photo_url ? (
        <img src={item.photo_url} alt={item.nom} className="h-full w-full object-cover" />
      ) : (
        <span style={{ color: readableText(item.couleur_hex || '#888') }}>{cat?.emoji}</span>
      )}
    </div>
  )
}

export default function Semaine() {
  const navigate = useNavigate()
  const forecast = useForecast()
  const items = useWardrobeStore((s) => s.items)

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-2 font-display text-3xl">Prépare ta semaine 🗓️</h1>
      <p className="mb-6 text-muted">Une tenue suggérée pour chaque jour, selon la météo.</p>

      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {forecast.map((day, i) => {
          const mood = WEATHER_MOOD[day.condition] || 'decontracte'
          const outfit = generateOutfits(items, mood, 1)[0]
          const ids = outfit
            ? [outfit.haut_id, outfit.bas_id, outfit.chaussures_id, outfit.accessoire_id].filter(Boolean)
            : []
          return (
            <div key={i} className="w-40 shrink-0 snap-start card p-4">
              <div className="mb-3 text-center">
                <p className="font-display">{day.jour}</p>
                <p className="text-3xl">{day.emoji}</p>
                <p className="label-mono">{day.temp}°C · {day.condition}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {ids.length ? ids.map((id) => <MiniPiece key={id} id={id} />) : <p className="text-xs text-muted">—</p>}
              </div>
              {outfit && (
                <p className="mt-3 text-center text-xs text-cream/80">{outfit.emoji_look} {outfit.nom}</p>
              )}
            </div>
          )
        })}
      </div>
    </PageTransition>
  )
}

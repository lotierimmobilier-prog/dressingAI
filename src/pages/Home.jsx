import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MapPin, Loader2, Sparkles, Palette, Camera, Shirt, ShoppingBag, Check, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MirrorBackground from '../components/layout/MirrorBackground'
import PageTransition from '../components/layout/PageTransition'
import MoodSelector from '../components/outfit/MoodSelector'
import OutfitCard from '../components/outfit/OutfitCard'
import SlotMachine from '../components/outfit/SlotMachine'
import { useWeather } from '../hooks/useWeather'
import { useAuthStore } from '../stores/authStore'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { useOutfitStore } from '../stores/outfitStore'
import { useGameification } from '../hooks/useGameification'
import { generateOutfits } from '../lib/outfitEngine'
import { suggestOutfits, isClaudeConfigured } from '../lib/claude'
import { buildVintedUrl } from '../lib/vintedUrl'
import { COULEUR_DU_MOMENT, COLOR_WHEEL, MOTIF_DU_MOMENT } from '../lib/constants'

export default function Home() {
  const navigate = useNavigate()
  const { weather, loading } = useWeather()
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const items = useWardrobeStore((s) => s.items)
  const logPort = useOutfitStore((s) => s.logPort)
  const wear = useWardrobeStore((s) => s.wear)
  const { reward } = useGameification()

  const [mood, setMood] = useState(null)
  const [palette, setPalette] = useState(profile?.couleurs_fetiches || ['#8B7CF0', '#FF6B6B', '#A8E6CF'])
  const [outfits, setOutfits] = useState([])
  const [index, setIndex] = useState(0)
  const [thinking, setThinking] = useState(false)

  const tint = mood?.tint || palette[0] || '#8B7CF0'

  async function selectMood(m) {
    setMood(m)
    setThinking(true)
    setOutfits([])
    setIndex(0)
    let result = []
    if (isClaudeConfigured && items.length) {
      try {
        const data = await suggestOutfits({
          dressing: items.map((i) => ({ id: i.id, nom: i.nom, categorie: i.categorie, couleur: i.couleur_dominante, style: i.style })),
          humeur: m.label,
          temp: weather?.temp,
          condition: weather?.description,
          couleurs: palette,
        })
        result = data?.tenues || []
      } catch {
        result = []
      }
    }
    if (!result.length) result = generateOutfits(items, m.id)
    setOutfits(result)
    setThinking(false)
  }

  async function handleWear(tenue) {
    const ids = [tenue.haut_id, tenue.bas_id, tenue.chaussures_id, tenue.accessoire_id].filter(Boolean)
    ids.forEach((id) => wear(id))
    await logPort(
      { vetements: ids, humeur: `${mood.emoji} ${mood.label}`, meteo: weather ? `${weather.temp}°C ${weather.emoji}` : '', tenue_id: null },
      user.id,
    )
    reward('wear_outfit')
    setIndex((i) => Math.min(i + 1, outfits.length - 1))
  }

  const current = outfits[index]

  // Sélection multiple de couleurs (max 4) : remplace la plus ancienne au-delà.
  const toggleColor = (c) =>
    setPalette((cur) => {
      if (cur.includes(c)) return cur.filter((x) => x !== c)
      if (cur.length >= 4) return [...cur.slice(1), c]
      return [...cur, c]
    })

  // Sélecteur libre : ajoute une couleur personnalisée à la palette.
  const addCustom = (c) =>
    setPalette((cur) => {
      if (cur.includes(c)) return cur
      if (cur.length >= 4) return [...cur.slice(1), c]
      return [...cur, c]
    })
  const removeColor = (c) => setPalette((cur) => cur.filter((x) => x !== c))

  return (
    <MirrorBackground tint={tint}>
      <PageTransition className="px-4 pt-8">
        {/* En-tête météo + salut */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <p className="label-mono">Bonjour {profile?.avatar_emoji}</p>
            <h1 className="font-display text-3xl">{profile?.prenom || 'toi'}</h1>
          </div>
          <WeatherBadge weather={weather} loading={loading} />
        </header>

        {/* Accueil nouveau compte : dressing vide */}
        {items.length === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/dressing?add=1')}
            className="mb-6 flex w-full items-center gap-4 rounded-3xl border border-accent/30 bg-accent/10 p-4 text-left"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-bg">
              <Camera size={22} />
            </div>
            <div>
              <p className="font-display">Bienvenue {profile?.prenom} 👋</p>
              <p className="text-sm text-muted">
                Ton dressing est vide. Ajoute ta première pièce pour recevoir des tenues.
              </p>
            </div>
          </motion.button>
        )}

        {/* Miroir central : humeur */}
        <section className="mb-6">
          <p className="mb-3 font-display text-lg">Quelle est ton humeur ?</p>
          <MoodSelector value={mood?.id} onChange={selectMood} />
        </section>

        {/* Palette du jour — choisis tes couleurs */}
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Palette size={16} className="text-muted" />
            <p className="label-mono">Palette du jour</p>
            <span className="label-mono ml-auto">{palette.length}/4</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {COLOR_WHEEL.map((c) => {
              const on = palette.includes(c)
              return (
                <button
                  key={c}
                  onClick={() => toggleColor(c)}
                  aria-label={`Couleur ${c}`}
                  className="relative aspect-square rounded-xl border border-white/10 transition"
                  style={{
                    background: c,
                    transform: on ? 'scale(1.12)' : 'scale(1)',
                    boxShadow: on ? `0 0 0 2px ${c}, 0 0 12px ${c}aa` : 'none',
                  }}
                >
                  {on && (
                    <span className="absolute inset-0 grid place-items-center">
                      <Check size={13} className="text-bg mix-blend-difference" />
                    </span>
                  )}
                </button>
              )
            })}
            {/* Sélecteur libre (couleur personnalisée) */}
            <label
              className="relative grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-white/25 text-muted"
              title="Couleur personnalisée"
            >
              <Plus size={16} />
              <input
                type="color"
                onChange={(e) => addCustom(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
          <p className="mt-2 label-mono">Touche une couleur (ou + pour une couleur libre)</p>

          {/* Aperçu de la palette choisie — tap pour retirer */}
          {palette.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => removeColor(c)}
                  className="group relative h-8 w-8 rounded-full border border-white/15"
                  style={{ background: c }}
                  title="Retirer"
                >
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <X size={13} className="text-cream" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Suggestions IA */}
        <AnimatePresence mode="wait">
          {thinking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-surface/60 py-10 text-muted"
            >
              <Loader2 className="animate-spin text-accent" /> Le styliste compose tes tenues…
            </motion.div>
          )}

          {!thinking && current && (
            <motion.section key={`outfit-${index}`} className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="label-mono flex items-center gap-1.5">
                  <Sparkles size={14} className="text-accent" /> Suggestion {index + 1}/{outfits.length}
                </p>
                {!isClaudeConfigured && <span className="label-mono text-mint">démo</span>}
              </div>
              <OutfitCard
                tenue={current}
                accent={tint}
                onWear={() => handleWear(current)}
                onNext={() => setIndex((i) => (i + 1) % outfits.length)}
                onVinted={(desc) => window.open(buildVintedUrl({ description: desc }), '_blank')}
              />
            </motion.section>
          )}

          {!thinking && mood && !current && (
            <motion.div
              key="empty-outfit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-surface/60 p-6 text-center"
            >
              <Shirt size={32} className="text-white/20" />
              <p className="text-muted">
                Pas assez de pièces pour composer une tenue {mood.emoji}
              </p>
              <button onClick={() => navigate('/dressing?add=1')} className="btn-primary">
                <Camera size={18} /> Ajouter des vêtements
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Random Outfit Machine */}
        {items.length > 0 && (
          <section className="mb-6 card p-4">
            <p className="mb-3 font-display text-lg">🎰 Random Outfit Machine</p>
            <SlotMachine dressing={items} onResult={() => reward('wear_outfit')} />
          </section>
        )}

        {/* Shopper un look (capture → boutiques) */}
        <button
          onClick={() => navigate('/shop')}
          className="mb-6 flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-accent/15 to-coral/10 p-4 text-left"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-bg">
            <ShoppingBag size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-display">Shopper un look 🛍️</p>
            <p className="text-sm text-muted">
              Une capture Pinterest/TikTok → l’IA trouve les pièces en boutique.
            </p>
          </div>
        </button>

        {/* Couleur du moment */}
        <section
          className="mb-4 flex items-center gap-4 rounded-3xl border border-white/10 p-4"
          style={{ background: `linear-gradient(120deg, ${COULEUR_DU_MOMENT.hex}22, transparent)` }}
        >
          <div className="h-14 w-14 shrink-0 rounded-2xl" style={{ background: COULEUR_DU_MOMENT.hex }} />
          <div className="min-w-0">
            <p className="label-mono">Couleur du moment · {COULEUR_DU_MOMENT.semaine}</p>
            <p className="font-display">{COULEUR_DU_MOMENT.nom}</p>
            <button
              onClick={() => navigate('/dressing')}
              className="mt-1 text-sm text-accent underline-offset-2 hover:underline"
            >
              Voir mes pièces dans cette couleur →
            </button>
          </div>
        </section>

        {/* Motif du moment (tendance réelle) */}
        <section className="mb-4 flex items-center gap-4 rounded-3xl border border-white/10 p-4">
          <div
            className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10"
            style={MOTIF_DU_MOMENT.pattern}
          />
          <div className="min-w-0">
            <p className="label-mono">Motif du moment · {MOTIF_DU_MOMENT.saison}</p>
            <p className="font-display">{MOTIF_DU_MOMENT.nom}</p>
            <p className="text-sm text-muted">{MOTIF_DU_MOMENT.note}</p>
            <button
              onClick={() =>
                window.open(
                  buildVintedUrl({ description: MOTIF_DU_MOMENT.recherche }),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
              className="mt-1 text-sm text-accent underline-offset-2 hover:underline"
            >
              Trouver ce motif sur Vinted →
            </button>
          </div>
        </section>
      </PageTransition>
    </MirrorBackground>
  )
}

function WeatherBadge({ weather, loading }) {
  if (loading) {
    return (
      <div className="glass rounded-2xl px-3 py-2">
        <Loader2 className="animate-spin text-muted" size={18} />
      </div>
    )
  }
  if (!weather) return null
  return (
    <div className="glass rounded-2xl px-3.5 py-2 text-right">
      <div className="flex items-center gap-1.5">
        <span className="text-xl">{weather.emoji}</span>
        <span className="font-display text-xl">{weather.temp}°</span>
      </div>
      <p className="label-mono flex items-center justify-end gap-1">
        <MapPin size={10} /> {weather.ville}
      </p>
    </div>
  )
}

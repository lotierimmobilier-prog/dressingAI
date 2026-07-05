import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { tileGradient, readableText } from '../../lib/colors'
import { CATEGORIES, TAGS } from '../../lib/constants'
import { haptic } from '../../hooks/useGameification'

/** Carte vêtement avec rotation 3D au survol + long-press → actions rapides. */
export default function ClothingCard({ item, onClick, onLongPress, size = 'grid' }) {
  const timer = useRef(null)
  const cat = CATEGORIES.find((c) => c.id === item.categorie)
  const isFav = item.tags?.includes('favori')
  const activeTags = (item.tags || []).filter((t) => t !== 'favori')

  const startPress = () => {
    timer.current = setTimeout(() => {
      haptic([10, 40, 10])
      onLongPress?.(item)
    }, 500)
  }
  const cancelPress = () => clearTimeout(timer.current)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-3d group relative text-left"
      onClick={() => onClick?.(item)}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
    >
      <div
        className={`relative w-full overflow-hidden rounded-3xl border border-white/10 ${
          size === 'lookbook' ? 'aspect-[3/4]' : 'aspect-square'
        }`}
        style={{ background: item.couleur_hex ? tileGradient(item.couleur_hex) : '#222' }}
      >
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.nom}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget
              if (!t.dataset.fb && item.photo_fallback) {
                t.dataset.fb = '1'
                t.src = item.photo_fallback
              }
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl opacity-80"
            style={{ color: readableText(item.couleur_hex || '#888') }}
          >
            {cat?.emoji || '👗'}
          </div>
        )}

        {/* Reflet brillant au survol */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

        {isFav && (
          <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-bg/60 backdrop-blur">
            <Star size={14} className="fill-accent text-accent" />
          </span>
        )}

        {activeTags.length > 0 && (
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {activeTags.map((t) => {
              const tag = TAGS.find((x) => x.id === t)
              return (
                <span key={t} className="text-sm" title={tag?.label}>
                  {tag?.emoji}
                </span>
              )
            })}
          </div>
        )}

        {/* Bandeau infos bas */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 pt-6">
          <p className="line-clamp-1 text-sm font-medium text-cream">{item.nom}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="label-mono">{item.couleur_dominante}</span>
            {item.nb_ports > 0 && (
              <span className="label-mono">· {item.nb_ports}× porté</span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

import { motion } from 'framer-motion'
import { Check, ArrowRight, ShoppingBag } from 'lucide-react'
import { tileGradient, readableText, lighten } from '../../lib/colors'
import { CATEGORIES } from '../../lib/constants'
import { useWardrobeStore } from '../../stores/wardrobeStore'

/** Une pièce miniature dans le polaroid. */
function Piece({ id }) {
  const item = useWardrobeStore((s) => s.byId(id))
  if (!item) return null
  const cat = CATEGORIES.find((c) => c.id === item.categorie)
  return (
    <div
      className="relative aspect-square overflow-hidden rounded-xl border border-black/10"
      style={{ background: tileGradient(item.couleur_hex || '#888') }}
      title={item.nom}
    >
      {item.photo_url ? (
        <img src={item.photo_url} alt={item.nom} className="h-full w-full object-cover" />
      ) : (
        <div
          className="grid h-full w-full place-items-center text-2xl"
          style={{ color: readableText(item.couleur_hex || '#888') }}
        >
          {cat?.emoji}
        </div>
      )}
    </div>
  )
}

/**
 * Tenue proposée façon "polaroid" avec fond coloré assorti.
 * Boutons : "Je porte ça !" + "Suivante" + recherche Vinted des pièces manquantes.
 */
export default function OutfitCard({ tenue, accent = '#E8C547', onWear, onNext, onVinted }) {
  const ids = [tenue.haut_id, tenue.bas_id, tenue.chaussures_id, tenue.accessoire_id].filter(Boolean)
  const score = tenue.score_coherence ?? tenue.score_ia ?? 80

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, x: -60, rotate: -4 }}
      className="mx-auto w-full max-w-sm rounded-3xl p-4 shadow-card"
      style={{ background: `linear-gradient(160deg, ${lighten(accent, 0.05)}, ${accent})` }}
    >
      {/* Cadre polaroid blanc */}
      <div className="rounded-2xl bg-cream p-3 pb-4 text-bg">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-lg">{tenue.emoji_look || '✨'} {tenue.nom}</span>
          <span className="rounded-full bg-bg px-2.5 py-1 font-mono text-xs text-accent">
            {score}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ids.map((id) => (
            <Piece key={id} id={id} />
          ))}
        </div>

        <p className="mt-3 text-sm text-bg/80">{tenue.description_look}</p>

        {tenue.pieces_manquantes?.length > 0 && (
          <button
            onClick={() => onVinted?.(tenue.pieces_manquantes[0])}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-bg/90 px-3 py-2 text-sm text-cream"
          >
            <ShoppingBag size={15} /> Trouver « {tenue.pieces_manquantes[0]} » sur Vinted
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onWear}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-bg px-4 py-3 font-medium text-cream active:scale-95"
        >
          <Check size={18} /> Je porte ça !
        </button>
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-1.5 rounded-full bg-bg/20 px-4 py-3 text-bg active:scale-95"
        >
          Suivante <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

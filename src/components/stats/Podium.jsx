import { tileGradient, readableText } from '../../lib/colors'
import { CATEGORIES } from '../../lib/constants'

const MEDALS = ['🥇', '🥈', '🥉']
const HEIGHTS = ['h-28', 'h-20', 'h-16']
const ORDER = [1, 0, 2] // 2e, 1er, 3e pour le vrai podium

/** Podium des 3 vêtements les plus portés. */
export default function Podium({ items }) {
  const top = items.slice(0, 3)
  return (
    <div className="flex items-end justify-center gap-2">
      {ORDER.map((rank) => {
        const item = top[rank]
        if (!item) return <div key={rank} className="w-1/3" />
        const cat = CATEGORIES.find((c) => c.id === item.categorie)
        return (
          <div key={rank} className="flex w-1/3 flex-col items-center">
            <div
              className="mb-2 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-white/10"
              style={{ background: tileGradient(item.couleur_hex || '#888') }}
            >
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.nom} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl" style={{ color: readableText(item.couleur_hex || '#888') }}>
                  {cat?.emoji}
                </span>
              )}
            </div>
            <p className="mb-1 line-clamp-1 text-center text-xs text-cream/90">{item.nom}</p>
            <div className={`flex w-full ${HEIGHTS[rank]} flex-col items-center justify-start rounded-t-xl bg-gradient-to-b from-accent/25 to-accent/5 pt-2`}>
              <span className="text-2xl">{MEDALS[rank]}</span>
              <span className="label-mono mt-1">{item.nb_ports}×</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

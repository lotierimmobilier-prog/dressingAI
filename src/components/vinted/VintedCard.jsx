import { ShoppingBag, ArrowUpRight } from 'lucide-react'
import { buildVintedUrl } from '../../lib/vintedUrl'

/** Mini-card preview style Vinted : placeholder + fourchette prix + lien. */
export default function VintedCard({ description, categorie, couleur, prix }) {
  const url = buildVintedUrl({ description, categorie, couleur })
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-2 p-2.5 transition hover:border-mint/40"
    >
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-mint/30 to-mint/5 text-mint">
        <ShoppingBag size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-cream">{description}</p>
        {prix && (
          <p className="label-mono mt-0.5 text-mint">
            ~ {prix.min}–{prix.max} €
          </p>
        )}
      </div>
      <span className="flex items-center gap-1 text-xs text-muted transition group-hover:text-mint">
        Vinted <ArrowUpRight size={14} />
      </span>
    </a>
  )
}

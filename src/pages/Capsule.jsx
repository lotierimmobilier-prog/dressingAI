import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import ClothingCard from '../components/wardrobe/ClothingCard'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { possibleOutfits, versatilityScore } from '../lib/stats'

/**
 * Capsule Wardrobe Builder — sélectionne jusqu'à 10 pièces essentielles
 * (favoris + plus portées + couverture des catégories) et estime le nombre
 * de tenues possibles.
 */
function buildCapsule(items) {
  const scored = [...items].sort((a, b) => {
    const favA = a.tags?.includes('favori') ? 5 : 0
    const favB = b.tags?.includes('favori') ? 5 : 0
    return favB + (b.nb_ports || 0) - (favA + (a.nb_ports || 0))
  })
  const capsule = []
  const cats = {}
  // Priorité : couvrir chaque catégorie, puis remplir avec les meilleures pièces.
  for (const it of scored) {
    if (capsule.length >= 10) break
    cats[it.categorie] = (cats[it.categorie] || 0) + 1
    if (cats[it.categorie] <= 3) capsule.push(it)
  }
  return capsule.slice(0, 10)
}

export default function Capsule() {
  const navigate = useNavigate()
  const items = useWardrobeStore((s) => s.items)
  const capsule = useMemo(() => buildCapsule(items), [items])
  const nbOutfits = useMemo(() => possibleOutfits(capsule), [capsule])
  const score = useMemo(() => versatilityScore(capsule), [capsule])

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-2 font-display text-3xl">Capsule Wardrobe 🧳</h1>
      <p className="mb-6 text-muted">Tes {capsule.length} pièces essentielles, un maximum de tenues.</p>

      <div className="mb-6 rounded-3xl bg-gradient-to-br from-accent/20 to-transparent p-6 text-center">
        <p className="label-mono">Avec ces {capsule.length} pièces</p>
        <p className="my-1 font-display text-5xl text-accent">{nbOutfits}</p>
        <p className="text-cream">tenues possibles !</p>
        <p className="mt-2 label-mono">Versatilité {score}/100</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {capsule.map((it) => (
          <ClothingCard key={it.id} item={it} />
        ))}
      </div>

      {capsule.length < 5 && (
        <p className="mt-6 text-center text-sm text-muted">
          Ajoute plus de pièces pour débloquer une vraie capsule polyvalente.
        </p>
      )}
    </PageTransition>
  )
}

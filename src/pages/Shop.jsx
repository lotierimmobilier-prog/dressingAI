import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, ArrowLeft, ShoppingBag, ExternalLink, Sparkles, Tag, Ruler } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import { analyzeLook, isClaudeConfigured } from '../lib/claude'
import { RETAILERS, hasAffiliate } from '../lib/affiliate'
import { tileGradient } from '../lib/colors'
import { haptic } from '../hooks/useGameification'
import { useAuthStore } from '../stores/authStore'

/** Ajoute la taille/pointure de l'utilisateur à la requête selon la catégorie. */
function sizeSuffix(categorie, men) {
  if (!men) return ''
  if (categorie === 'chaussures') return men.pointure ? `pointure ${men.pointure}` : ''
  if (categorie === 'bas') return men.taille_bas ? `taille ${men.taille_bas}` : ''
  // haut / robe / manteau / accessoire → taille haut (lettre)
  return men.taille_haut ? `taille ${men.taille_haut}` : ''
}

// Exemple montré quand l'IA n'est pas active (pour visualiser le concept).
const DEMO_PIECES = [
  { nom: 'Blazer oversize beige', categorie: 'manteau', couleur: 'Beige', couleur_hex: '#D9C7A8', details: 'Coupe oversize, revers cranté, double boutonnage, lin/viscose', description_recherche: 'blazer oversize beige lin double boutonnage femme', boutiques: ['zalando', 'asos', 'google'], prix_estime_min: 30, prix_estime_max: 70 },
  { nom: 'Jean mom taille haute', categorie: 'bas', couleur: 'Bleu clair', couleur_hex: '#8FA9C9', details: 'Taille haute, coupe mom, délavé clair, ourlet brut', description_recherche: 'jean mom taille haute délavé clair ourlet brut', boutiques: ['shein', 'zalando', 'vinted', 'google'], prix_estime_min: 20, prix_estime_max: 45 },
  { nom: 'Baskets blanches minimalistes', categorie: 'chaussures', couleur: 'Blanc', couleur_hex: '#F2F2EF', details: 'Cuir lisse, semelle fine, minimalistes, tige basse', description_recherche: 'baskets blanches cuir minimalistes semelle fine basses', boutiques: ['zalando', 'amazon', 'google'], prix_estime_min: 35, prix_estime_max: 90 },
]

/** Boutiques à afficher pour une pièce : celles recommandées par l'IA (+ Google
 *  comme filet, car il agrège de nombreuses boutiques). Fallback = toutes. */
function retailersFor(piece) {
  const ids = piece?.boutiques
  if (!Array.isArray(ids) || !ids.length) return RETAILERS
  const ordered = ids.filter((id) => RETAILERS.some((r) => r.id === id))
  if (!ordered.includes('google')) ordered.push('google')
  return ordered.map((id) => RETAILERS.find((r) => r.id === id)).filter(Boolean)
}

export default function Shop() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const mensurations = profile?.mensurations || {}
  const hasSizes = Boolean(mensurations.taille_haut || mensurations.taille_bas || mensurations.pointure)
  const [useSizes, setUseSizes] = useState(true)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pieces, setPieces] = useState(null)
  const [demo, setDemo] = useState(false)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setPieces(null)
    setLoading(true)
    setDemo(false)
    try {
      if (isClaudeConfigured) {
        const res = await analyzeLook(file)
        setPieces(res?.pieces?.length ? res.pieces : DEMO_PIECES)
        if (!res?.pieces?.length) setDemo(true)
      } else {
        setPieces(DEMO_PIECES)
        setDemo(true)
      }
    } catch {
      setPieces(DEMO_PIECES)
      setDemo(true)
    } finally {
      setLoading(false)
    }
  }

  function openShop(retailer, piece) {
    const base = piece.description_recherche || piece.nom
    const suffix = useSizes && hasSizes ? sizeSuffix(piece.categorie, mensurations) : ''
    const query = [base, suffix].filter(Boolean).join(' ')
    haptic([10, 20])
    window.open(retailer.build(query), '_blank', 'noopener,noreferrer')
  }

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-1 font-display text-3xl">Shopper un look 🛍️</h1>
      <p className="mb-6 text-muted">
        Une capture d’écran (Pinterest, TikTok, Google…) → l’IA repère les pièces → tu les
        trouves en boutique.
      </p>

      {/* Upload */}
      <label className="mb-6 flex cursor-pointer flex-col items-center gap-3 rounded-3xl border border-dashed border-white/20 bg-surface-2 py-10">
        {preview ? (
          <img src={preview} alt="look" className="max-h-56 rounded-2xl object-contain" />
        ) : (
          <>
            <Camera size={32} className="text-accent" />
            <span className="text-sm text-muted">Ajoute une capture d’écran d’un look</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-muted">
          <Loader2 className="animate-spin text-accent" /> L’IA analyse le look…
        </div>
      )}

      {pieces && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-mono flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" /> {pieces.length} pièces repérées
            </p>
            {demo && <span className="label-mono text-mint">exemple</span>}
          </div>

          {/* Taille pré-remplie depuis le profil */}
          {hasSizes ? (
            <button
              onClick={() => setUseSizes((v) => !v)}
              className={`chip w-fit ${useSizes ? 'border-accent/50 bg-accent/20 text-accent' : ''}`}
            >
              <Ruler size={13} /> {useSizes ? 'Ma taille incluse ✓' : 'Inclure ma taille'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/mes-tailles')}
              className="flex w-fit items-center gap-1.5 text-xs text-accent underline-offset-2 hover:underline"
            >
              <Ruler size={13} /> Renseigne tes tailles pour des recherches plus précises
            </button>
          )}

          {pieces.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 rounded-2xl border border-white/10"
                  style={{ background: tileGradient(p.couleur_hex || '#888') }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.nom}</p>
                  <p className="label-mono">
                    {p.couleur}
                    {p.prix_estime_min ? ` · ~${p.prix_estime_min}–${p.prix_estime_max} €` : ''}
                  </p>
                  {p.details && <p className="mt-0.5 text-xs text-cream/70">{p.details}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {retailersFor(p).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => openShop(r, p)}
                    className="flex items-center justify-between gap-1 rounded-xl border border-white/10 bg-surface-2 px-3 py-2.5 text-sm transition hover:border-white/25"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      {r.label}
                    </span>
                    <ExternalLink size={14} className="text-muted" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Mention légale affiliation */}
          <div className="flex items-start gap-2 rounded-2xl bg-white/[0.03] p-3 text-xs text-muted">
            <Tag size={14} className="mt-0.5 shrink-0" />
            <p>
              Certains liens sont affiliés : si tu achètes via ces liens, DressingAI peut
              percevoir une commission, sans surcoût pour toi.
              {!hasAffiliate && ' (Affiliation non encore configurée.)'}
            </p>
          </div>
        </div>
      )}

      {!pieces && !loading && !isClaudeConfigured && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-accent/10 p-3 text-sm text-accent">
          <ShoppingBag size={16} /> Active l’IA (Claude) pour détecter automatiquement les
          pièces d’un look.
        </p>
      )}
    </PageTransition>
  )
}

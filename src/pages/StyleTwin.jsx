import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import MirrorBackground from '../components/layout/MirrorBackground'
import Button from '../components/ui/Button'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { analyzeStyleTwin, isClaudeConfigured } from '../lib/claude'

/** Fallback local déterministe basé sur les styles dominants du dressing. */
function localTwin(items) {
  const styleCount = {}
  items.forEach((i) => (i.style || []).forEach((s) => (styleCount[s] = (styleCount[s] || 0) + 1)))
  const top = Object.entries(styleCount).sort((a, b) => b[1] - a[1]).map(([s]) => s)
  const palette = [...new Set(items.map((i) => i.couleur_hex))].slice(0, 3)
  const titre = top.length
    ? `La ${top[0]} moderne aux accents ${top[1] || 'intemporels'}`
    : 'L’Explorateur·rice de style'
  return {
    titre_style: titre.charAt(0).toUpperCase() + titre.slice(1),
    description:
      'Ta garde-robe raconte une personne qui aime les basiques bien choisis relevés par des pièces à caractère. Un équilibre entre confort et affirmation.',
    influences: [top[0] || 'Minimalisme', 'Seconde main chic', 'Palette maîtrisée'],
    palette_signature: palette.length ? palette : ['#E8C547', '#FF6B6B', '#A8E6CF'],
    conseil_signature: 'Ose un accessoire statement pour twister tes basiques.',
    celebrite_style: 'Zoë Kravitz',
    _demo: true,
  }
}

export default function StyleTwin() {
  const navigate = useNavigate()
  const items = useWardrobeStore((s) => s.items)
  const [twin, setTwin] = useState(null)
  const [loading, setLoading] = useState(false)

  async function reveal() {
    setLoading(true)
    let result = null
    if (isClaudeConfigured && items.length) {
      try {
        result = await analyzeStyleTwin(
          items.map((i) => ({ nom: i.nom, categorie: i.categorie, couleur: i.couleur_dominante, style: i.style })),
        )
      } catch {
        result = null
      }
    }
    setTwin(result || localTwin(items))
    setLoading(false)
  }

  const tint = twin?.palette_signature?.[0] || '#FF6B6B'

  return (
    <MirrorBackground tint={tint}>
      <PageTransition className="px-4 pt-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
          <ArrowLeft size={16} /> Retour
        </button>
        <h1 className="mb-2 font-display text-3xl">Style Twin 🪞</h1>
        <p className="mb-6 text-muted">Ton alter ego style, révélé par l’IA depuis ton dressing.</p>

        {!twin ? (
          <div className="mt-10 flex flex-col items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-7xl"
            >
              🪞
            </motion.div>
            <Button variant="primary" onClick={reveal} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              Révéler mon Style Twin
            </Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="card p-6 text-center">
              <p className="label-mono mb-2">Tu es…</p>
              <h2 className="font-display text-2xl text-gradient">{twin.titre_style}</h2>
              <p className="mt-3 text-cream/90">{twin.description}</p>
            </div>

            <div className="card p-5">
              <p className="label-mono mb-3">Palette signature</p>
              <div className="flex gap-2">
                {twin.palette_signature.map((c, i) => (
                  <div key={i} className="h-14 flex-1 rounded-2xl" style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="label-mono mb-3">Influences</p>
              <div className="flex flex-wrap gap-2">
                {twin.influences.map((inf, i) => (
                  <span key={i} className="chip">{inf}</span>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="label-mono mb-1">Conseil signature</p>
              <p className="text-cream">💡 {twin.conseil_signature}</p>
            </div>

            {twin.celebrite_style && (
              <div className="card flex items-center gap-3 p-5">
                <span className="text-2xl">⭐</span>
                <p>
                  Ton style rappelle celui de <span className="font-display text-accent">{twin.celebrite_style}</span>.
                </p>
              </div>
            )}

            <Button variant="ghost" className="w-full" onClick={() => setTwin(null)}>
              Recommencer
            </Button>
          </motion.div>
        )}
      </PageTransition>
    </MirrorBackground>
  )
}

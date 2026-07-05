import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Wand2, Loader2, Save, MessageCircleHeart, Plus, X } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import OutfitCard from '../components/outfit/OutfitCard'
import VintedCard from '../components/vinted/VintedCard'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { useOutfitStore } from '../stores/outfitStore'
import { useAuthStore } from '../stores/authStore'
import { useGameification } from '../hooks/useGameification'
import { useVinted } from '../hooks/useVinted'
import { useClaudeVision } from '../hooks/useClaudeVision'
import { generateOutfits } from '../lib/outfitEngine'
import { evaluateOutfit, isClaudeConfigured } from '../lib/claude'
import { tileGradient, readableText } from '../lib/colors'
import { CATEGORIES } from '../lib/constants'

const SLOTS = [
  { key: 'haut', label: 'Haut', cats: ['haut', 'robe'] },
  { key: 'bas', label: 'Bas', cats: ['bas'] },
  { key: 'chaussures', label: 'Chaussures', cats: ['chaussures'] },
  { key: 'accessoire', label: 'Accessoire', cats: ['accessoire', 'manteau'] },
]

export default function Builder() {
  const [mode, setMode] = useState('manuel')
  return (
    <PageTransition className="px-4 pt-8">
      <header className="mb-4">
        <h1 className="font-display text-3xl">Créer une tenue</h1>
        <p className="label-mono">Compose ou scanne une pièce</p>
      </header>

      <div className="mb-6 flex gap-1 rounded-2xl bg-white/5 p-1">
        <TabBtn active={mode === 'manuel'} onClick={() => setMode('manuel')}>
          🎨 Composer
        </TabBtn>
        <TabBtn active={mode === 'scan'} onClick={() => setMode('scan')}>
          📸 Photo Scan
        </TabBtn>
      </div>

      {mode === 'manuel' ? <ManualBuilder /> : <PhotoScan />}
    </PageTransition>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2.5 text-sm transition ${active ? 'bg-accent text-bg' : 'text-muted'}`}
    >
      {children}
    </button>
  )
}

/* ---------- Mode B : composer manuellement ---------- */
function ManualBuilder() {
  const items = useWardrobeStore((s) => s.items)
  const byId = useWardrobeStore((s) => s.byId)
  const saveTenue = useOutfitStore((s) => s.saveTenue)
  const user = useAuthStore((s) => s.user)
  const { reward } = useGameification()
  const { gaps } = useVinted(items)

  const [selection, setSelection] = useState({ haut: null, bas: null, chaussures: null, accessoire: null })
  const [pickerSlot, setPickerSlot] = useState(null)
  const [advice, setAdvice] = useState(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [saved, setSaved] = useState(false)

  const filled = Object.values(selection).filter(Boolean).length

  async function askAI() {
    setLoadingAdvice(true)
    setAdvice(null)
    const pieces = Object.entries(selection)
      .filter(([, v]) => v)
      .map(([slot, id]) => {
        const it = byId(id)
        return { slot, nom: it?.nom, couleur: it?.couleur_dominante, style: it?.style }
      })
    let result = null
    if (isClaudeConfigured) {
      try {
        result = await evaluateOutfit(pieces)
      } catch {
        result = null
      }
    }
    if (!result) {
      const score = 70 + Math.min(25, filled * 6)
      result = {
        score,
        verdict: score > 80 ? 'Combo très cohérent, on valide ! ✨' : 'Bonne base, ça se tient.',
        point_fort: 'L’équilibre des couleurs fonctionne.',
        amelioration: filled < 3 ? 'Ajoute une pièce pour compléter la silhouette.' : 'Ose un accessoire qui contraste.',
        emoji: score > 80 ? '🔥' : '👍',
      }
    }
    setAdvice(result)
    if (result.score >= 80) reward('ai_validated')
    setLoadingAdvice(false)
  }

  async function validate() {
    await saveTenue(
      {
        nom: 'Ma tenue',
        haut_id: selection.haut,
        bas_id: selection.bas,
        chaussures_id: selection.chaussures,
        accessoire_id: selection.accessoire,
        score_ia: advice?.score || null,
      },
      user.id,
    )
    reward('wear_outfit')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Touche une zone puis choisis une pièce de ton dressing.</p>
      <div className="grid grid-cols-2 gap-3">
        {SLOTS.map((slot) => {
          const item = selection[slot.key] ? byId(selection[slot.key]) : null
          return (
            <button
              key={slot.key}
              onClick={() => setPickerSlot(slot)}
              className="relative aspect-square overflow-hidden rounded-3xl border border-dashed border-white/15"
              style={item ? { background: tileGradient(item.couleur_hex || '#888'), borderStyle: 'solid' } : undefined}
            >
              {item ? (
                <>
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.nom} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl" style={{ color: readableText(item.couleur_hex || '#888') }}>
                      {CATEGORIES.find((c) => c.id === item.categorie)?.emoji}
                    </div>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelection((s) => ({ ...s, [slot.key]: null }))
                    }}
                    className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-bg/70"
                  >
                    <X size={14} />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-center text-xs text-cream">{item.nom}</span>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted">
                  <Plus size={22} />
                  <span className="text-sm">{slot.label}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={askAI} disabled={filled < 2 || loadingAdvice}>
          {loadingAdvice ? <Loader2 className="animate-spin" size={18} /> : <MessageCircleHeart size={18} />}
          Avis IA
        </Button>
        <Button variant="primary" className="flex-1" onClick={validate} disabled={filled < 2}>
          <Save size={18} /> {saved ? 'Enregistré !' : 'Valider'}
        </Button>
      </div>

      <AnimatePresence>
        {advice && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-lg">{advice.emoji} Avis du styliste</span>
              <span className="rounded-full bg-accent px-3 py-1 font-mono text-sm text-bg">{advice.score}%</span>
            </div>
            <p className="mb-2 text-cream">{advice.verdict}</p>
            <p className="text-sm text-mint">✓ {advice.point_fort}</p>
            <p className="text-sm text-accent">→ {advice.amelioration}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inspirations Vinted */}
      {gaps.length > 0 && (
        <section>
          <p className="mb-2 font-display">🛍️ Inspirations Vinted</p>
          <div className="space-y-2">
            {gaps.map((g, i) => (
              <VintedCard key={i} description={g.label} categorie={g.categorie} prix={g.prix} />
            ))}
          </div>
        </section>
      )}

      {/* Picker */}
      <Modal open={!!pickerSlot} onClose={() => setPickerSlot(null)} title={`Choisir : ${pickerSlot?.label}`}>
        <div className="grid grid-cols-3 gap-3">
          {items
            .filter((it) => pickerSlot?.cats.includes(it.categorie))
            .map((it) => (
              <button
                key={it.id}
                onClick={() => {
                  setSelection((s) => ({ ...s, [pickerSlot.key]: it.id }))
                  setPickerSlot(null)
                }}
                className="aspect-square overflow-hidden rounded-2xl border border-white/10"
                style={{ background: tileGradient(it.couleur_hex || '#888') }}
              >
                {it.photo_url ? (
                  <img src={it.photo_url} alt={it.nom} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl" style={{ color: readableText(it.couleur_hex || '#888') }}>
                    {CATEGORIES.find((c) => c.id === it.categorie)?.emoji}
                  </div>
                )}
              </button>
            ))}
        </div>
      </Modal>
    </div>
  )
}

/* ---------- Mode A : photo scan ---------- */
function PhotoScan() {
  const items = useWardrobeStore((s) => s.items)
  const { analyze, analyzing } = useClaudeVision()
  const [preview, setPreview] = useState(null)
  const [combos, setCombos] = useState([])
  const [detected, setDetected] = useState(null)

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setCombos([])
    const result = await analyze(file)
    setDetected(result)
    // On cherche les pièces compatibles → 3 combinaisons via le moteur local.
    const moodByStyle = result?.style?.[0]
    const map = { chic: 'pro', casual: 'decontracte', sport: 'move', soirée: 'shine', streetwear: 'dark', vintage: 'zen' }
    const outfits = generateOutfits(items, map[moodByStyle] || 'decontracte', 3)
    setCombos(outfits)
  }

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border border-dashed border-white/20 bg-surface-2 py-10">
        {preview ? (
          <img src={preview} alt="scan" className="h-40 w-40 rounded-2xl object-cover" />
        ) : (
          <>
            <Camera size={32} className="text-accent" />
            <span className="text-sm text-muted">Prends ou choisis une photo d’une pièce</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>

      {analyzing && (
        <div className="flex items-center justify-center gap-2 text-muted">
          <Loader2 className="animate-spin text-accent" /> Analyse de la pièce…
        </div>
      )}

      {detected && (
        <div className="card flex items-center gap-3 p-3">
          <Wand2 className="text-mint" size={18} />
          <p className="text-sm">
            Détecté : <span className="text-cream">{detected.nom}</span> — on cherche des accords dans ton dressing.
          </p>
        </div>
      )}

      {combos.map((c, i) => (
        <div key={i}>
          <p className="label-mono mb-2">Combinaison {i + 1} · {c.score_coherence}%</p>
          <OutfitCard tenue={c} accent={detected?.couleur_hex || '#8B7CF0'} onWear={() => {}} onNext={() => {}} />
        </div>
      ))}
    </div>
  )
}

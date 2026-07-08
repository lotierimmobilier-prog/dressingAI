import { useState } from 'react'
import { ArrowLeft, Ruler, Check, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'

const TAILLES_LETTRE = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COUPES = ['Ajusté', 'Regular', 'Oversize']

// Champs de mesures (cm) — utiles pour acheter la bonne taille en ligne.
const MESURES = [
  { key: 'poitrine', label: 'Tour de poitrine' },
  { key: 'taille', label: 'Tour de taille' },
  { key: 'hanches', label: 'Tour de hanches' },
  { key: 'entrejambe', label: 'Entrejambe' },
  { key: 'hauteur', label: 'Taille (hauteur)' },
]

export default function MesTailles() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const saveProfile = useAuthStore((s) => s.saveProfile)

  const [m, setM] = useState(() => ({
    taille_haut: '',
    taille_bas: '',
    pointure: '',
    poitrine: '',
    taille: '',
    hanches: '',
    entrejambe: '',
    hauteur: '',
    coupe: '',
    notes: '',
    ...(profile?.mensurations || {}),
  }))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (patch) => setM((cur) => ({ ...cur, ...patch }))

  async function handleSave() {
    setSaving(true)
    await saveProfile({ mensurations: m })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <PageTransition className="px-4 pt-8">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Retour
      </button>
      <h1 className="mb-1 flex items-center gap-2 font-display text-3xl">
        <Ruler size={26} className="text-accent" /> Mes tailles
      </h1>
      <p className="mb-6 text-muted">
        Renseigne tes tailles et mesures : on t’aide à acheter la bonne taille en ligne.
      </p>

      <div className="space-y-5">
        {/* Tailles vêtements */}
        <section className="card p-5">
          <h2 className="mb-3 font-display">Tailles vêtements</h2>

          <p className="label-mono mb-1.5">Haut</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {TAILLES_LETTRE.map((t) => (
              <button
                key={t}
                onClick={() => set({ taille_haut: t })}
                className={`chip ${m.taille_haut === t ? 'bg-accent text-bg border-accent' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label-mono mb-1.5">Bas (taille)</p>
              <input
                className="input"
                placeholder="ex : 40 ou 30"
                value={m.taille_bas}
                onChange={(e) => set({ taille_bas: e.target.value })}
              />
            </div>
            <div>
              <p className="label-mono mb-1.5">Pointure</p>
              <input
                className="input"
                type="number"
                placeholder="ex : 39"
                value={m.pointure}
                onChange={(e) => set({ pointure: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Mesures */}
        <section className="card p-5">
          <h2 className="mb-3 font-display">Mes mesures (cm)</h2>
          <div className="grid grid-cols-2 gap-3">
            {MESURES.map((mes) => (
              <div key={mes.key}>
                <p className="label-mono mb-1.5">{mes.label}</p>
                <input
                  className="input"
                  type="number"
                  placeholder="cm"
                  value={m[mes.key]}
                  onChange={(e) => set({ [mes.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Préférences */}
        <section className="card p-5">
          <h2 className="mb-3 font-display">Préférences</h2>
          <p className="label-mono mb-1.5">Coupe préférée</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {COUPES.map((c) => (
              <button
                key={c}
                onClick={() => set({ coupe: c })}
                className={`chip ${m.coupe === c ? 'bg-accent text-bg border-accent' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="label-mono mb-1.5">Notes</p>
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="Ex : je taille grand du haut, sensible aux matières synthétiques…"
            value={m.notes}
            onChange={(e) => set({ notes: e.target.value })}
          />
        </section>

        <Button variant="primary" className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          {saved ? 'Enregistré !' : 'Enregistrer mes tailles'}
        </Button>
      </div>
    </PageTransition>
  )
}

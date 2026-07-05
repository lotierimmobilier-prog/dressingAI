import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import MirrorBackground from '../components/layout/MirrorBackground'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import { STYLES, COLOR_WHEEL } from '../lib/constants'

const AVATARS = ['🦋', '🌟', '🖤', '🌸', '🔥', '🌿', '👑', '🎨', '🕶️', '🦩', '⚡', '🍒']

export default function Onboarding() {
  const saveProfile = useAuthStore((s) => s.saveProfile)
  const [step, setStep] = useState(0)
  const [prenom, setPrenom] = useState('')
  const [avatar, setAvatar] = useState('🦋')
  const [styles, setStyles] = useState([])
  const [couleurs, setCouleurs] = useState([])
  const [budget, setBudget] = useState(40)
  const [saving, setSaving] = useState(false)

  const toggleStyle = (s) =>
    setStyles((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
  const toggleColor = (c) =>
    setCouleurs((cur) => {
      if (cur.includes(c)) return cur.filter((x) => x !== c)
      if (cur.length >= 3) return cur
      return [...cur, c]
    })

  const canNext = [prenom.trim().length > 0, styles.length > 0, couleurs.length === 3, true][step]

  async function finish() {
    setSaving(true)
    await saveProfile({
      prenom: prenom.trim(),
      avatar_emoji: avatar,
      styles_preferes: styles,
      couleurs_fetiches: couleurs,
      budget_moyen: budget,
      points: 0,
      badges: [],
    })
    setSaving(false)
  }

  const next = () => (step < 3 ? setStep(step + 1) : finish())

  const tint = couleurs[0] || '#8B7CF0'

  return (
    <MirrorBackground tint={tint}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${i <= step ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
              transition={{ duration: 0.35 }}
            >
              {step === 0 && (
                <div>
                  <h2 className="mb-2 font-display text-3xl">Comment tu t’appelles ?</h2>
                  <p className="mb-6 text-muted">Et choisis ton avatar.</p>
                  <input
                    className="input mb-6 text-lg"
                    placeholder="Ton prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    autoFocus
                  />
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={`aspect-square rounded-2xl text-2xl transition ${
                          avatar === a ? 'bg-accent/20 ring-2 ring-accent' : 'bg-white/5'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="mb-2 font-display text-3xl">Ton style ?</h2>
                  <p className="mb-6 text-muted">Choisis-en autant que tu veux.</p>
                  <div className="flex flex-wrap gap-2.5">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`rounded-full border px-4 py-2.5 transition ${
                          styles.includes(s)
                            ? 'border-accent bg-accent text-bg'
                            : 'border-white/10 bg-white/5 text-cream'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="mb-2 font-display text-3xl">Tes couleurs fétiches</h2>
                  <p className="mb-6 text-muted">Choisis-en 3 ({couleurs.length}/3).</p>
                  <div className="grid grid-cols-4 gap-3">
                    {COLOR_WHEEL.map((c) => {
                      const selected = couleurs.includes(c)
                      return (
                        <button
                          key={c}
                          onClick={() => toggleColor(c)}
                          className="relative aspect-square rounded-2xl border border-white/10 transition"
                          style={{
                            background: c,
                            transform: selected ? 'scale(1.08)' : 'scale(1)',
                            boxShadow: selected ? `0 0 0 3px ${c}, 0 0 20px ${c}88` : 'none',
                          }}
                        >
                          {selected && (
                            <span className="absolute inset-0 grid place-items-center">
                              <Check size={18} className="text-bg mix-blend-difference" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="mb-2 font-display text-3xl">Ton budget moyen</h2>
                  <p className="mb-8 text-muted">Par achat, pour ajuster nos suggestions.</p>
                  <div className="mb-4 text-center font-display text-5xl text-accent">{budget} €</div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="mt-2 flex justify-between label-mono">
                    <span>5 €</span>
                    <span>200 €+</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <Button variant="primary" className="mt-8 w-full" onClick={next} disabled={!canNext || saving}>
          {step === 3 ? 'C’est parti !' : 'Continuer'} <ArrowRight size={18} />
        </Button>
      </div>
    </MirrorBackground>
  )
}

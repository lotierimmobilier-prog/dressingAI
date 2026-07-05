import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dices, RotateCw } from 'lucide-react'
import { tileGradient, readableText } from '../../lib/colors'
import { CATEGORIES } from '../../lib/constants'
import { haptic } from '../../hooks/useGameification'

/** Bip doux "casino" via Web Audio API (optionnel, sans asset). */
function playTick() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 620
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
    setTimeout(() => ctx.close(), 200)
  } catch {
    /* silencieux */
  }
}

function Reel({ items, spinning, finalItem, delay }) {
  // Bande verticale : on empile les items et on translate vers le bas.
  const strip = useMemo(() => {
    const base = []
    for (let i = 0; i < 8; i += 1) base.push(items[Math.floor((i * 7 + delay) % items.length)])
    if (finalItem) base.push(finalItem)
    return base
  }, [items, finalItem, delay])

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/10 bg-surface-2">
      <motion.div
        animate={
          spinning
            ? { y: ['0%', '-700%'] }
            : { y: `-${(strip.length - 1) * 100}%` }
        }
        transition={
          spinning
            ? { duration: 0.5, repeat: Infinity, ease: 'linear' }
            : { duration: 0.6, delay, ease: [0.2, 0.9, 0.2, 1] }
        }
        className="absolute inset-0"
      >
        {strip.map((item, i) => {
          const cat = CATEGORIES.find((c) => c.id === item?.categorie)
          return (
            <div
              key={i}
              className="flex h-24 w-full flex-col items-center justify-center gap-1"
              style={{ background: item ? tileGradient(item.couleur_hex || '#888') : '#222' }}
            >
              <span className="text-2xl" style={{ color: readableText(item?.couleur_hex || '#888') }}>
                {cat?.emoji || '❓'}
              </span>
              <span className="line-clamp-1 px-1 text-[10px] font-medium text-bg/90">{item?.nom}</span>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

/**
 * Random Outfit Machine — 3 rouleaux (haut / bas / accessoire) qui défilent
 * et s'arrêtent un par un. Re-spin gratuit x3/jour.
 */
export default function SlotMachine({ dressing, onResult, sound = true }) {
  const hauts = dressing.filter((i) => i.categorie === 'haut' || i.categorie === 'robe')
  const bas = dressing.filter((i) => i.categorie === 'bas' || i.categorie === 'chaussures')
  const acc = dressing.filter((i) => i.categorie === 'accessoire' || i.categorie === 'manteau')

  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [spinsLeft, setSpinsLeft] = useState(3)
  const stopTimers = useRef([])

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)] || null

  function spin() {
    if (spinning || (result && spinsLeft <= 0)) return
    haptic([8, 20, 8])
    setSpinning(true)
    setResult(null)
    const chosen = { haut: pick(hauts), bas: pick(bas), accessoire: pick(acc) }

    // Arrêt échelonné des 3 rouleaux.
    stopTimers.current.forEach(clearTimeout)
    stopTimers.current = [
      setTimeout(() => sound && playTick(), 900),
      setTimeout(() => sound && playTick(), 1300),
      setTimeout(() => {
        if (sound) playTick()
        setSpinning(false)
        setResult(chosen)
        setSpinsLeft((n) => (result ? n - 1 : n))
        onResult?.(chosen)
        haptic([12, 30, 12, 30, 40])
      }, 1700),
    ]
  }

  const canRespin = result && spinsLeft > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Reel items={hauts.length ? hauts : dressing} spinning={spinning} finalItem={result?.haut} delay={0} />
        <Reel items={bas.length ? bas : dressing} spinning={spinning} finalItem={result?.bas} delay={0.2} />
        <Reel items={acc.length ? acc : dressing} spinning={spinning} finalItem={result?.accessoire} delay={0.4} />
      </div>

      {!result ? (
        <button
          onClick={spin}
          disabled={spinning}
          className="btn-primary w-full py-4 text-lg font-display disabled:opacity-60"
        >
          <Dices size={22} /> {spinning ? 'Ça tourne…' : 'Surprends-moi 🎰'}
        </button>
      ) : (
        <button
          onClick={canRespin ? spin : undefined}
          disabled={!canRespin || spinning}
          className="btn-ghost w-full py-4"
        >
          <RotateCw size={18} /> {canRespin ? `Re-spin (${spinsLeft} restants)` : 'Plus de re-spin aujourd’hui'}
        </button>
      )}
    </div>
  )
}

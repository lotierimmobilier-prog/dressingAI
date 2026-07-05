import { motion } from 'framer-motion'
import { MOODS } from '../../lib/constants'
import { haptic } from '../../hooks/useGameification'

/** Sélecteur d'humeur — grandes icônes animées qui pilotent la teinte du miroir. */
export default function MoodSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {MOODS.map((mood, i) => {
        const active = value === mood.id
        return (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              haptic(15)
              onChange(mood)
            }}
            className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition ${
              active ? 'border-transparent' : 'border-white/10 bg-white/[0.03]'
            }`}
            style={active ? { background: `${mood.tint}22`, borderColor: `${mood.tint}88` } : undefined}
          >
            <motion.span
              className="text-2xl"
              animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {mood.emoji}
            </motion.span>
            <span className="text-center text-[10px] leading-tight text-cream/90">{mood.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

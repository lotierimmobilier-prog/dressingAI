import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Confetti aux couleurs fournies (ex: couleurs du vêtement ajouté).
 * Léger, sans dépendance : particules DOM animées via framer-motion.
 */
export default function Confetti({ colors = ['#8B7CF0', '#FF6B6B', '#A8E6CF'], count = 42, run }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!run) return
    const seed = Array.from({ length: count }).map((_, i) => ({
      id: `${run}-${i}`,
      x: (i / count) * 100 + (i % 5) * 2 - 5,
      color: colors[i % colors.length] || '#8B7CF0',
      rotate: i * 33,
      delay: (i % 10) * 0.02,
      size: 6 + (i % 4) * 2,
    }))
    setPieces(seed)
    const t = setTimeout(() => setPieces([]), 1600)
    return () => clearTimeout(t)
  }, [run, count, colors])

  if (!pieces.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.4, ease: 'easeIn', delay: p.delay }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

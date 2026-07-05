import { motion } from 'framer-motion'

/**
 * Transition "tissu qui tombe" : slide + léger blur + opacity.
 * Enveloppe chaque page pour donner l'effet signature entre les routes.
 */
export default function PageTransition({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.main>
  )
}

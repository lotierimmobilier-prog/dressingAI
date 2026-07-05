import { motion } from 'framer-motion'
import { haptic } from '../../hooks/useGameification'

const VARIANTS = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  coral: 'btn-coral',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  vibrate = true,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      onClick={(e) => {
        if (vibrate) haptic()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

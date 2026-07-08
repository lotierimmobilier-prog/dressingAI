import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Modal / bottom-sheet.
 * - Par défaut : feuille qui monte du bas sur mobile, carte centrée sur desktop.
 * - `fullScreenMobile` : occupe TOUT l'écran sur mobile (idéal pour les fiches
 *   longues comme l'ajout/édition d'un vêtement), avec en-tête fixe + corps
 *   défilant.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  fullScreenMobile = false,
}) {
  // Rendu via portail sur <body> pour échapper au contexte d'empilement de la
  // transition de page (sinon la barre de navigation passe par-dessus).
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-[60] flex justify-center p-0 sm:p-4 ${
            fullScreenMobile ? 'items-stretch sm:items-center' : 'items-end sm:items-center'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative flex w-full ${maxWidth} flex-col overflow-hidden card ${
              fullScreenMobile
                ? 'h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl'
                : 'max-h-[90dvh] rounded-b-none sm:rounded-3xl'
            }`}
            initial={{ y: 60, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            {/* En-tête fixe */}
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4 safe-top">
              {title ? <h2 className="font-display text-xl">{title}</h2> : <span />}
              <button
                onClick={onClose}
                className="ml-auto rounded-full bg-white/5 p-2 transition hover:bg-white/10"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            {/* Corps défilant */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5 safe-bottom">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

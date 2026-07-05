import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Shirt, Sparkles, CalendarDays, User, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { haptic } from '../../hooks/useGameification'

const ITEMS = [
  { to: '/', label: 'Miroir', icon: Home },
  { to: '/dressing', label: 'Dressing', icon: Shirt },
  { to: '/builder', label: 'Tenue', icon: Sparkles },
  { to: '/historique', label: 'Historique', icon: CalendarDays },
  { to: '/profil', label: 'Profil', icon: User },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      {/* FAB caméra — toujours visible, ajout rapide de vêtement */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          haptic([10, 30])
          navigate('/dressing?add=1')
        }}
        className="fixed right-4 bottom-24 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-bg shadow-glow"
        aria-label="Ajouter un vêtement"
      >
        <Camera size={24} />
      </motion.button>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 safe-bottom">
        <div className="mx-auto max-w-lg px-3 pb-2">
          <div className="glass rounded-3xl px-2 py-2 flex items-center justify-between shadow-card">
            {ITEMS.map(({ to, label, icon: Icon }) => {
              const active =
                to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => haptic()}
                  className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-2xl bg-white/8"
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={`relative z-10 transition-colors ${
                      active ? 'text-accent' : 'text-muted'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-[10px] font-mono transition-colors ${
                      active ? 'text-cream' : 'text-muted'
                    }`}
                  >
                    {label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}

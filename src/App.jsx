import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './stores/authStore'
import { useWardrobeStore } from './stores/wardrobeStore'
import { useOutfitStore } from './stores/outfitStore'
import Navbar from './components/layout/Navbar'

import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Dressing from './pages/Dressing'
import Builder from './pages/Builder'
import Historique from './pages/Historique'
import StyleTwin from './pages/StyleTwin'
import Capsule from './pages/Capsule'
import Semaine from './pages/Semaine'
import Shop from './pages/Shop'
import MesTailles from './pages/MesTailles'
import Profil from './pages/Profil'

export default function App() {
  const location = useLocation()
  const { init, user, profile, loading } = useAuthStore()
  const loadWardrobe = useWardrobeStore((s) => s.load)
  const loadOutfits = useOutfitStore((s) => s.load)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (user) {
      loadWardrobe(user.id)
      loadOutfits(user.id)
    }
  }, [user, loadWardrobe, loadOutfits])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg">
        <div className="animate-float-slow font-display text-2xl text-gradient">DressingAI</div>
      </div>
    )
  }

  // Non connecté → auth
  if (!user) return <Auth />

  // Connecté mais profil incomplet (le trigger crée une ligne vide) → onboarding
  if (!profile || !profile.prenom) return <Onboarding />

  return (
    <div className="mx-auto min-h-screen max-w-lg overflow-x-hidden pb-28">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/dressing" element={<Dressing />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/style-twin" element={<StyleTwin />} />
          <Route path="/capsule" element={<Capsule />} />
          <Route path="/semaine" element={<Semaine />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/mes-tailles" element={<MesTailles />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Navbar />
    </div>
  )
}

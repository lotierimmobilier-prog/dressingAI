import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Sparkles } from 'lucide-react'
import MirrorBackground from '../components/layout/MirrorBackground'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, enterDemo } = useAuthStore()

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const fn = mode === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await fn(email, password)
    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <MirrorBackground tint="#8B7CF0">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="mx-auto mb-4 h-20 w-20 drop-shadow-glow" />
          <h1 className="font-display text-5xl font-bold tracking-tight">
            <span className="text-cream">Dressing</span>
            <span className="text-gradient">AI</span>
          </h1>
          <p className="mt-2 text-muted">Ta garde-robe, sublimée par l’IA.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={submit}
          className="card space-y-3 p-6"
        >
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-11"
              type="email"
              required
              placeholder="Ton email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-11"
              type="password"
              required
              minLength={6}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <Button variant="primary" className="w-full" type="submit" disabled={busy}>
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="w-full text-center text-sm text-muted hover:text-cream"
          >
            {mode === 'login' ? 'Pas encore de compte ? Inscris-toi' : 'Déjà un compte ? Connecte-toi'}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-white/10" />
            <span className="label-mono">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button variant="ghost" className="w-full" type="button" onClick={signInWithGoogle}>
            Continuer avec Google
          </Button>
        </motion.form>

        {!isSupabaseConfigured && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => enterDemo({ freshOnboarding: false })}
            className="mt-4 flex items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            <Sparkles size={16} /> Explorer en mode démo (sans compte)
          </motion.button>
        )}
      </div>
    </MirrorBackground>
  )
}

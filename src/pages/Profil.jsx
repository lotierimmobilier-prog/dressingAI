import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Users, Mail, ChevronRight, Trophy, Wand2, Shirt, CalendarRange, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/layout/PageTransition'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { useGameification } from '../hooks/useGameification'
import { isSupabaseConfigured } from '../lib/supabase'
import { isClaudeConfigured } from '../lib/claude'

const SHORTCUTS = [
  { to: '/style-twin', icon: Wand2, label: 'Style Twin', desc: 'Ton alter ego mode', color: '#FF6B6B' },
  { to: '/capsule', icon: Shirt, label: 'Capsule Wardrobe', desc: '10 pièces, X tenues', color: '#A8E6CF' },
  { to: '/semaine', icon: CalendarRange, label: 'Ma semaine', desc: 'Météo + tenues 7j', color: '#8B7CF0' },
]

export default function Profil() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const saveProfile = useAuthStore((s) => s.saveProfile)
  const itemsCount = useWardrobeStore((s) => s.items.length)
  const { level, badges } = useGameification()

  const [shareOpen, setShareOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [members, setMembers] = useState([
    { email: profile?.prenom ? `${profile.prenom}` : 'Moi', color: '#8B7CF0' },
  ])

  const points = profile?.points || 0

  function invite() {
    if (!inviteEmail) return
    const colors = ['#FF6B6B', '#A8E6CF', '#7FA6C9', '#FF9EC4']
    setMembers((m) => [...m, { email: inviteEmail, color: colors[m.length % colors.length] }])
    setInviteEmail('')
  }

  return (
    <PageTransition className="px-4 pt-8">
      {/* En-tête profil */}
      <header className="mb-6 flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-accent/30 to-coral/20 text-4xl">
          {profile?.avatar_emoji || '🦋'}
        </div>
        <div>
          <h1 className="font-display text-2xl">{profile?.prenom || 'Toi'}</h1>
          <p className="label-mono">{itemsCount} pièces · {profile?.styles_preferes?.join(' · ')}</p>
        </div>
      </header>

      {/* Niveau + progression */}
      <section className="card mb-5 p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            <span className="font-display">Niveau {level.level} · {level.title}</span>
          </div>
          <span className="font-mono text-accent">{points} pts</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-coral"
            initial={{ width: 0 }}
            animate={{ width: `${level.progress * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        {level.next && (
          <p className="mt-2 label-mono">
            Plus que {level.next.min - points} pts pour « {level.next.title} »
          </p>
        )}
      </section>

      {/* Badges */}
      <section className="card mb-5 p-5">
        <h2 className="mb-3 font-display">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition ${
                b.unlocked ? 'bg-accent/10' : 'bg-white/[0.03] opacity-40'
              }`}
            >
              <span className="text-2xl" style={!b.unlocked ? { filter: 'grayscale(1)' } : undefined}>
                {b.emoji}
              </span>
              <span className="text-[11px] leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Raccourcis fonctions uniques */}
      <section className="mb-5 space-y-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left transition hover:bg-surface-2"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${s.color}22`, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium">{s.label}</p>
              <p className="label-mono">{s.desc}</p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}
      </section>

      {/* Dressing partagé */}
      <section className="card mb-5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display">
            <Users size={18} className="text-mint" /> Dressing partagé
          </h2>
          <button onClick={() => setShareOpen(true)} className="text-sm text-accent">Gérer</button>
        </div>
        <div className="flex -space-x-2">
          {members.map((m, i) => (
            <span
              key={i}
              className="grid h-9 w-9 place-items-center rounded-full border-2 border-bg text-xs font-medium text-bg"
              style={{ background: m.color }}
              title={m.email}
            >
              {m.email[0]?.toUpperCase()}
            </span>
          ))}
          <button
            onClick={() => setShareOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-dashed border-white/30 text-muted"
          >
            +
          </button>
        </div>
      </section>

      {/* Statut config */}
      <section className="card mb-5 flex items-start gap-3 p-4 text-sm">
        <Info size={18} className="mt-0.5 shrink-0 text-muted" />
        <div className="space-y-1">
          <StatusRow label="Supabase (compte & sync)" ok={isSupabaseConfigured} />
          <StatusRow label="Claude IA (vision & styliste)" ok={isClaudeConfigured} />
          <p className="pt-1 text-muted">
            Renseigne les clés dans <code className="text-cream">.env.local</code> pour activer le mode complet.
          </p>
        </div>
      </section>

      <Button variant="ghost" className="mb-4 w-full" onClick={signOut}>
        <LogOut size={18} /> Se déconnecter
      </Button>

      {/* Modal invitation */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Dressing partagé">
        <div className="space-y-4">
          <p className="text-sm text-muted">Invite ta famille ou tes colocs à partager ce dressing.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input pl-11"
                type="email"
                placeholder="email@exemple.fr"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={invite}>Inviter</Button>
          </div>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <span className="h-8 w-8 rounded-full" style={{ background: m.color }} />
                <span className="flex-1 text-sm">{m.email}</span>
                {i === 0 && <span className="label-mono">Propriétaire</span>}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </PageTransition>
  )
}

function StatusRow({ label, ok }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-mint' : 'bg-muted'}`} />
      <span className="text-cream/90">{label}</span>
      <span className="label-mono ml-auto">{ok ? 'actif' : 'démo'}</span>
    </div>
  )
}

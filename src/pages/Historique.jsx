import { useMemo, useState } from 'react'
import { Sparkles, Recycle, TrendingUp, Coins, Download } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import CalendarView from '../components/stats/CalendarView'
import DonutChart from '../components/stats/DonutChart'
import Podium from '../components/stats/Podium'
import ClothingCard from '../components/wardrobe/ClothingCard'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { useOutfitStore } from '../stores/outfitStore'
import { useAuthStore } from '../stores/authStore'
import { colorDistribution, mostWorn, neglected, versatilityScore, costPerWear } from '../lib/stats'

export default function Historique() {
  const items = useWardrobeStore((s) => s.items)
  const wear = useWardrobeStore((s) => s.wear)
  const historique = useOutfitStore((s) => s.historique)
  const profile = useAuthStore((s) => s.profile)
  const [dayModal, setDayModal] = useState(null)
  const [bilanOpen, setBilanOpen] = useState(false)

  const stats = useMemo(
    () => ({
      colors: colorDistribution(items),
      top: mostWorn(items),
      neglected: neglected(items, 60, new Date('2026-07-05')),
      versatility: versatilityScore(items),
      cpw: costPerWear(items),
    }),
    [items],
  )

  return (
    <PageTransition className="px-4 pt-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl">Historique</h1>
        <button onClick={() => setBilanOpen(true)} className="btn-ghost px-4 py-2.5">
          <Download size={16} /> Bilan
        </button>
      </header>

      {/* Calendrier */}
      <section className="card mb-5 p-4">
        <CalendarView historique={historique} onSelectDay={setDayModal} />
      </section>

      {/* KPI rapides */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Versatilité" value={`${stats.versatility}/100`} color="#A8E6CF" />
        <StatCard icon={Coins} label="Coût / port" value={stats.cpw ? `${stats.cpw} €` : '—'} color="#E8C547" />
      </div>

      {/* Podium */}
      <section className="card mb-5 p-4">
        <h2 className="mb-4 flex items-center gap-2 font-display">
          <Sparkles size={18} className="text-accent" /> Le plus porté
        </h2>
        <Podium items={stats.top} />
      </section>

      {/* Donut couleurs */}
      <section className="card mb-5 p-4">
        <h2 className="mb-4 font-display">Couleur dominante</h2>
        <DonutChart data={stats.colors} />
      </section>

      {/* Réveille-les */}
      {stats.neglected.length > 0 && (
        <section className="card mb-5 p-4">
          <h2 className="mb-3 flex items-center gap-2 font-display">
            <Recycle size={18} className="text-coral" /> Réveille-les !
          </h2>
          <p className="mb-3 text-sm text-muted">Pas portés depuis 60+ jours.</p>
          <div className="grid grid-cols-3 gap-3">
            {stats.neglected.slice(0, 6).map((it) => (
              <ClothingCard key={it.id} item={it} onClick={() => wear(it.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Modal détail du jour */}
      <Modal open={!!dayModal} onClose={() => setDayModal(null)} title={dayModal?.date_port} maxWidth="max-w-xs">
        {dayModal && (
          <div>
            <p className="mb-3 label-mono">{dayModal.humeur} · {dayModal.meteo}</p>
            <div className="grid grid-cols-3 gap-2">
              {dayModal.vetements?.map((id) => {
                const it = items.find((x) => x.id === id)
                return it ? <ClothingCard key={id} item={it} /> : null
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Bilan Mode — wrapped */}
      <Modal open={bilanOpen} onClose={() => setBilanOpen(false)} title="Mon Bilan Mode">
        <BilanCard profile={profile} stats={stats} items={items} />
      </Modal>
    </PageTransition>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4">
      <Icon size={20} style={{ color }} />
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="label-mono">{label}</p>
    </div>
  )
}

function BilanCard({ profile, stats, items }) {
  const topColor = stats.colors[0]
  return (
    <div className="space-y-4">
      <div
        id="bilan"
        className="rounded-3xl p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${topColor?.color || '#E8C547'}, #0D0D0D)` }}
      >
        <p className="label-mono text-cream/80">Bilan Mode · {profile?.prenom}</p>
        <p className="my-3 font-display text-4xl text-cream">{items.length} pièces</p>
        <div className="grid grid-cols-2 gap-3 text-left">
          <BilanStat label="Couleur star" value={topColor?.label || '—'} />
          <BilanStat label="Versatilité" value={`${stats.versatility}/100`} />
          <BilanStat label="Top porté" value={stats.top[0]?.nom?.slice(0, 16) || '—'} />
          <BilanStat label="Points" value={profile?.points || 0} />
        </div>
        <p className="mt-4 font-display text-lg text-cream">Dressify ✨</p>
      </div>
      <Button variant="primary" className="w-full" onClick={() => window.print()}>
        <Download size={18} /> Enregistrer / Partager
      </Button>
      <p className="text-center text-xs text-muted">
        Astuce : « Enregistrer en PDF » depuis la boîte d’impression pour partager ta carte.
      </p>
    </div>
  )
}

function BilanStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-black/30 p-3">
      <p className="label-mono text-cream/70">{label}</p>
      <p className="font-display text-cream">{value}</p>
    </div>
  )
}

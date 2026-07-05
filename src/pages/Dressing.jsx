import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, LayoutGrid, Rows3, BookOpen, Shirt, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import PageTransition from '../components/layout/PageTransition'
import ClothingCard from '../components/wardrobe/ClothingCard'
import FilterBar from '../components/wardrobe/FilterBar'
import AddClothingForm from '../components/wardrobe/AddClothingForm'
import Modal from '../components/ui/Modal'
import Confetti from '../components/ui/Confetti'
import { useWardrobeStore } from '../stores/wardrobeStore'
import { useAuthStore } from '../stores/authStore'
import { useGameification } from '../hooks/useGameification'
import { CATEGORIES, TAGS } from '../lib/constants'

const VIEWS = [
  { id: 'grid', icon: LayoutGrid, label: 'Grille' },
  { id: 'placard', icon: Rows3, label: 'Placard' },
  { id: 'lookbook', icon: BookOpen, label: 'Lookbook' },
]

export default function Dressing() {
  const [params, setParams] = useSearchParams()
  const items = useWardrobeStore((s) => s.items)
  const add = useWardrobeStore((s) => s.add)
  const remove = useWardrobeStore((s) => s.remove)
  const wear = useWardrobeStore((s) => s.wear)
  const user = useAuthStore((s) => s.user)
  const { reward } = useGameification()

  const [view, setView] = useState('grid')
  const [filters, setFilters] = useState({ categorie: null, saison: null, tag: null })
  const [addOpen, setAddOpen] = useState(false)
  const [quickItem, setQuickItem] = useState(null)
  const [confettiRun, setConfettiRun] = useState(null)
  const [confettiColors, setConfettiColors] = useState([])

  useEffect(() => {
    if (params.get('add')) {
      setAddOpen(true)
      params.delete('add')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const filtered = useMemo(
    () =>
      items.filter((it) => {
        if (filters.categorie && it.categorie !== filters.categorie) return false
        if (filters.saison && !(it.saison || []).includes(filters.saison)) return false
        if (filters.tag && !(it.tags || []).includes(filters.tag)) return false
        return true
      }),
    [items, filters],
  )

  async function handleSave(item) {
    await add(item, user.id)
    reward('add_clothing')
    setConfettiColors([item.couleur_hex, ...(item.couleurs_secondaires || [])].filter(Boolean))
    setConfettiRun(Date.now())
    setAddOpen(false)
  }

  const grouped = useMemo(() => {
    const g = {}
    CATEGORIES.forEach((c) => {
      g[c.id] = filtered.filter((it) => it.categorie === c.id)
    })
    return g
  }, [filtered])

  return (
    <PageTransition className="px-4 pt-8">
      <Confetti run={confettiRun} colors={confettiColors.length ? confettiColors : undefined} />

      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Mon dressing</h1>
          <p className="label-mono">{items.length} pièces</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary px-4 py-2.5">
          <Plus size={18} /> Ajouter
        </button>
      </header>

      {/* Sélecteur de vue */}
      <div className="mb-3 flex gap-1 rounded-2xl bg-white/5 p-1">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition ${
              view === v.id ? 'bg-accent text-bg' : 'text-muted'
            }`}
          >
            <v.icon size={16} /> {v.label}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <FilterBar filters={filters} setFilters={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={() => setAddOpen(true)} />
      ) : view === 'placard' ? (
        <div className="space-y-6">
          {CATEGORIES.map((c) =>
            grouped[c.id].length ? (
              <section key={c.id}>
                <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-1.5">
                  <span className="text-lg">{c.emoji}</span>
                  <h2 className="font-display">{c.label}</h2>
                  <span className="label-mono ml-auto">{grouped[c.id].length}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {grouped[c.id].map((it) => (
                    <ClothingCard key={it.id} item={it} onLongPress={setQuickItem} />
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div
          className={`grid gap-3 ${view === 'lookbook' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}
        >
          {filtered.map((it) => (
            <ClothingCard key={it.id} item={it} size={view === 'lookbook' ? 'lookbook' : 'grid'} onLongPress={setQuickItem} />
          ))}
        </div>
      )}

      {/* Modal ajout */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un vêtement">
        <AddClothingForm userId={user?.id} onSave={handleSave} onColors={setConfettiColors} />
      </Modal>

      {/* Actions rapides (long press) */}
      <Modal open={!!quickItem} onClose={() => setQuickItem(null)} title={quickItem?.nom} maxWidth="max-w-xs">
        {quickItem && (
          <div className="space-y-2">
            <QuickAction
              icon={CheckCircle2}
              label="Je l’ai porté aujourd’hui"
              onClick={() => {
                wear(quickItem.id)
                reward('wear_outfit')
                setQuickItem(null)
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              {TAGS.map((t) => {
                const on = quickItem.tags?.includes(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      useWardrobeStore.getState().toggleTag(quickItem.id, t.id)
                      setQuickItem({ ...quickItem, tags: on ? quickItem.tags.filter((x) => x !== t.id) : [...(quickItem.tags || []), t.id] })
                    }}
                    className={`chip justify-center ${on ? 'bg-accent/20 border-accent/50 text-accent' : ''}`}
                  >
                    {t.emoji} {t.label}
                  </button>
                )
              })}
            </div>
            <QuickAction
              icon={Trash2}
              label="Supprimer"
              danger
              onClick={() => {
                remove(quickItem.id)
                setQuickItem(null)
              }}
            />
          </div>
        )}
      </Modal>
    </PageTransition>
  )
}

function QuickAction({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
        danger ? 'bg-coral/10 text-coral hover:bg-coral/20' : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center text-muted">
      <Shirt size={48} className="text-white/20" />
      <p>Ton dressing est vide.</p>
      <button onClick={onAdd} className="btn-primary">
        <Plus size={18} /> Ajouter ma première pièce
      </button>
    </div>
  )
}

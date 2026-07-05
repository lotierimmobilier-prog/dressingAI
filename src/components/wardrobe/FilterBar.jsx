import { CATEGORIES, TAGS, SAISONS } from '../../lib/constants'

/** Barre de filtres horizontale scrollable (catégorie, saison, tag). */
export default function FilterBar({ filters, setFilters }) {
  const toggle = (key, value) =>
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }))

  const Pill = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`chip whitespace-nowrap transition ${
        active ? 'bg-accent text-bg border-accent' : ''
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-2">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <Pill key={c.id} active={filters.categorie === c.id} onClick={() => toggle('categorie', c.id)}>
            {c.emoji} {c.label}
          </Pill>
        ))}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {SAISONS.map((s) => (
          <Pill key={s} active={filters.saison === s} onClick={() => toggle('saison', s)}>
            {s}
          </Pill>
        ))}
        {TAGS.map((t) => (
          <Pill key={t.id} active={filters.tag === t.id} onClick={() => toggle('tag', t.id)}>
            {t.emoji} {t.label}
          </Pill>
        ))}
      </div>
    </div>
  )
}

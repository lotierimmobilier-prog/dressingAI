import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { tileGradient } from '../../lib/colors'
import { useWardrobeStore } from '../../stores/wardrobeStore'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Vue calendrier : chaque jour avec une miniature de la tenue portée. */
export default function CalendarView({ historique, onSelectDay }) {
  const byId = useWardrobeStore((s) => s.byId)
  // On ancre le calendrier sur le mois de la dernière entrée (ou date connue).
  const anchor = historique[0]?.date_port || '2026-07-01'
  const [cursor, setCursor] = useState(() => {
    const d = new Date(anchor)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const map = useMemo(() => {
    const m = {}
    historique.forEach((h) => {
      m[h.date_port] = h
    })
    return m
  }, [historique])

  const first = new Date(cursor.year, cursor.month, 1)
  const startOffset = (first.getDay() + 6) % 7 // Lundi = 0
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const shift = (dir) =>
    setCursor((c) => {
      const m = c.month + dir
      if (m < 0) return { year: c.year - 1, month: 11 }
      if (m > 11) return { year: c.year + 1, month: 0 }
      return { ...c, month: m }
    })

  const firstColor = (entry) => {
    const item = entry?.vetements?.map(byId).find(Boolean)
    return item?.couleur_hex || '#333'
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-full bg-white/5 p-2 active:scale-90">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display">{MONTHS[cursor.month]} {cursor.year}</span>
        <button onClick={() => shift(1)} className="rounded-full bg-white/5 p-2 active:scale-90">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {DAYS.map((d, i) => (
          <span key={i} className="label-mono text-center">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />
          const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const entry = map[key]
          return (
            <button
              key={i}
              onClick={() => entry && onSelectDay?.(entry)}
              className="relative aspect-square rounded-xl border border-white/5 text-[11px]"
              style={entry ? { background: tileGradient(firstColor(entry)) } : { background: '#ffffff05' }}
            >
              <span className={entry ? 'absolute left-1 top-0.5 text-bg/80' : 'text-muted'}>{day}</span>
              {entry && <span className="absolute bottom-0.5 right-1 text-[10px]">{entry.humeur?.split(' ')[0]}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

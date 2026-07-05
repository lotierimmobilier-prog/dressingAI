import { hexToRgb } from './colors'

/** Regroupe les couleurs proches en familles pour le donut. */
const FAMILIES = [
  { label: 'Noir', color: '#1A1A1A', ref: [26, 26, 26] },
  { label: 'Blanc', color: '#F5F5F0', ref: [245, 245, 240] },
  { label: 'Beige', color: '#D9C7A8', ref: [217, 199, 168] },
  { label: 'Jaune', color: '#E8C547', ref: [232, 197, 71] },
  { label: 'Corail/Rouge', color: '#FF6B6B', ref: [255, 107, 107] },
  { label: 'Menthe/Vert', color: '#A8E6CF', ref: [140, 200, 160] },
  { label: 'Bleu', color: '#4A6C8C', ref: [74, 108, 140] },
  { label: 'Marron', color: '#8A5A2B', ref: [138, 90, 43] },
]

function nearestFamily(hex) {
  const { r, g, b } = hexToRgb(hex || '#888888')
  let best = FAMILIES[0]
  let bestD = Infinity
  for (const f of FAMILIES) {
    const [pr, pg, pb] = f.ref
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (d < bestD) {
      bestD = d
      best = f
    }
  }
  return best
}

export function colorDistribution(items) {
  const counts = {}
  items.forEach((it) => {
    const fam = nearestFamily(it.couleur_hex)
    counts[fam.label] = counts[fam.label] || { label: fam.label, color: fam.color, value: 0 }
    counts[fam.label].value += 1
  })
  return Object.values(counts).sort((a, b) => b.value - a.value)
}

export function mostWorn(items) {
  return [...items].sort((a, b) => (b.nb_ports || 0) - (a.nb_ports || 0))
}

export function neglected(items, days = 60, today = new Date()) {
  const cutoff = today.getTime() - days * 86400000
  return items.filter((it) => {
    if (!it.derniere_date_port) return true
    return new Date(it.derniere_date_port).getTime() < cutoff
  })
}

/**
 * Score de versatilité /100 : combine la diversité des catégories, des styles
 * et des saisons couvertes — une garde-robe équilibrée score haut.
 */
export function versatilityScore(items) {
  if (!items.length) return 0
  const cats = new Set(items.map((i) => i.categorie))
  const styles = new Set(items.flatMap((i) => i.style || []))
  const saisons = new Set(items.flatMap((i) => i.saison || []))
  const catScore = Math.min(1, cats.size / 6) * 40
  const styleScore = Math.min(1, styles.size / 6) * 30
  const saisonScore = Math.min(1, saisons.size / 4) * 30
  return Math.round(catScore + styleScore + saisonScore)
}

/** Coût au port moyen (prix / nombre de ports), pièces avec prix renseigné. */
export function costPerWear(items) {
  const withPrice = items.filter((i) => i.prix_achat)
  if (!withPrice.length) return null
  const totals = withPrice.map((i) => i.prix_achat / Math.max(1, i.nb_ports || 0))
  const avg = totals.reduce((s, v) => s + v, 0) / totals.length
  return Math.round(avg * 100) / 100
}

/** Estimation combinatoire de tenues possibles (capsule). */
export function possibleOutfits(items) {
  const hauts = items.filter((i) => i.categorie === 'haut').length || 1
  const bas = items.filter((i) => i.categorie === 'bas').length || 1
  const robes = items.filter((i) => i.categorie === 'robe').length
  const chauss = items.filter((i) => i.categorie === 'chaussures').length || 1
  return hauts * bas * chauss + robes * chauss
}

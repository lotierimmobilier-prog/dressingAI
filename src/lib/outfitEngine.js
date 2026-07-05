/**
 * Moteur de suggestion local — génère des tenues plausibles depuis le dressing
 * sans appel réseau. Sert de fallback quand Claude n'est pas configuré, et de
 * base instantanée pour la slot machine / le mode démo.
 */
import { MOODS } from './constants'

const MOOD_STYLE = {
  decontracte: ['casual', 'streetwear'],
  pro: ['chic', 'minimaliste'],
  festif: ['soirée', 'chic'],
  zen: ['boho', 'casual'],
  dark: ['minimaliste', 'streetwear'],
  feelgood: ['casual', 'boho'],
  move: ['sport', 'streetwear'],
  shine: ['soirée', 'chic'],
}

function scoreItem(item, styles) {
  const s = item.style || []
  const overlap = s.filter((x) => styles.includes(x)).length
  return overlap * 2 + (item.tags?.includes('favori') ? 1 : 0)
}

function pickBest(items, cat, styles, exclude) {
  return items
    .filter((i) => i.categorie === cat && !exclude.has(i.id))
    .sort((a, b) => scoreItem(b, styles) - scoreItem(a, styles) + (Math.random() - 0.5))
    [0]
}

const NAMES = ['Le look du jour', 'Silhouette signature', 'Vibe spontanée', 'Combo malin', 'Allure affirmée']
const EMOJIS = ['🔥', '✨', '💫', '🌟', '🕶️']

/** Génère jusqu'à 3 tenues cohérentes pour une humeur donnée. */
export function generateOutfits(dressing, moodId, count = 3) {
  const styles = MOOD_STYLE[moodId] || ['casual']
  const mood = MOODS.find((m) => m.id === moodId)
  const outfits = []
  const used = new Set()

  for (let n = 0; n < count; n += 1) {
    const robe = Math.random() > 0.6 ? pickBest(dressing, 'robe', styles, used) : null
    const haut = robe ? null : pickBest(dressing, 'haut', styles, used)
    const bas = robe ? null : pickBest(dressing, 'bas', styles, used)
    const chauss = pickBest(dressing, 'chaussures', styles, used)
    const acc = pickBest(dressing, 'accessoire', styles, used)

    ;[robe, haut, bas, chauss, acc].forEach((i) => i && used.add(i.id))

    const chosen = [robe, haut, bas, chauss, acc].filter(Boolean)
    if (!chosen.length) break

    // Score de cohérence : moyenne des overlaps normalisée.
    const avg = chosen.reduce((s, i) => s + scoreItem(i, styles), 0) / chosen.length
    const score = Math.min(97, 62 + Math.round(avg * 9))

    const manquantes = []
    if (!chauss) manquantes.push(`chaussures ${styles[0]}`)
    if (!acc) manquantes.push(`accessoire ${mood?.hint?.split(',')[0] || 'assorti'}`)

    outfits.push({
      nom: NAMES[n % NAMES.length],
      haut_id: haut?.id || robe?.id || null,
      bas_id: bas?.id || null,
      chaussures_id: chauss?.id || null,
      accessoire_id: acc?.id || null,
      score_coherence: score,
      description_look: `Une tenue ${styles.join(' & ')} taillée pour ton humeur ${mood?.label?.toLowerCase() || ''}.`,
      emoji_look: EMOJIS[n % EMOJIS.length],
      pieces_manquantes: manquantes,
    })
  }
  return outfits
}

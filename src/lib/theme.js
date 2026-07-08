/**
 * Thème : couleur d'accent de l'app personnalisable par l'utilisateur.
 * On écrit la couleur dans des variables CSS (--accent-rgb) lues par Tailwind,
 * ce qui recolore toute l'interface en direct. Persisté en localStorage.
 */
import { hexToRgb, lighten } from './colors'

const KEY = 'dressingai-accent'
export const DEFAULT_ACCENT = '#8B7CF0'

// Presets lisibles avec du texte sombre (les boutons ont un texte foncé).
export const ACCENT_PRESETS = [
  { hex: '#8B7CF0', nom: 'Violet' },
  { hex: '#FF6B6B', nom: 'Corail' },
  { hex: '#A8E6CF', nom: 'Menthe' },
  { hex: '#E8C547', nom: 'Moutarde' },
  { hex: '#7FA6C9', nom: 'Bleu ciel' },
  { hex: '#FF9EC4', nom: 'Rose' },
  { hex: '#8FD4A8', nom: 'Vert' },
  { hex: '#F2A65A', nom: 'Ambre' },
]

const channels = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

/** Applique une couleur d'accent à toute l'app (variables CSS). */
export function applyAccent(hex) {
  const root = document.documentElement
  root.style.setProperty('--accent-rgb', channels(hex))
  root.style.setProperty('--accent-soft-rgb', channels(lighten(hex, 0.25)))
}

export function getAccent() {
  try {
    return localStorage.getItem(KEY) || DEFAULT_ACCENT
  } catch {
    return DEFAULT_ACCENT
  }
}

export function setAccent(hex) {
  try {
    localStorage.setItem(KEY, hex)
  } catch {
    /* ignore */
  }
  applyAccent(hex)
}

/** À appeler au démarrage pour restaurer la couleur choisie. */
export function initAccent() {
  applyAccent(getAccent())
}

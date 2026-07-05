/** Petites fonctions couleur partagées (placeholders, contrastes, dégradés). */

export function hexToRgb(hex) {
  const h = hex?.replace('#', '') || '888888'
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** Luminance perçue → choisit un texte lisible (noir ou crème). */
export function readableText(hex) {
  const { r, g, b } = hexToRgb(hex)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#0D0D0D' : '#F5F5F0'
}

export function lighten(hex, amount = 0.2) {
  const { r, g, b } = hexToRgb(hex)
  const mix = (c) => Math.round(c + (255 - c) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export function darken(hex, amount = 0.2) {
  const { r, g, b } = hexToRgb(hex)
  const mix = (c) => Math.round(c * (1 - amount))
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

/** Dégradé de fond pour une tuile sans photo. */
export function tileGradient(hex) {
  return `linear-gradient(145deg, ${lighten(hex, 0.15)}, ${darken(hex, 0.25)})`
}

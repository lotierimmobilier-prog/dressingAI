import { useState } from 'react'
import { analyzeClothing, isClaudeConfigured } from '../lib/claude'

/**
 * Mode démo : déduit des tags plausibles à partir de la couleur moyenne de
 * l'image (échantillonnée sur un canvas), quand Claude n'est pas configuré.
 */
async function demoAnalyze(file) {
  const hex = await averageColor(file)
  const nomCouleur = nearestColorName(hex)
  return {
    nom: `${nomCouleur} pièce à identifier`,
    categorie: 'haut',
    couleur_dominante: nomCouleur,
    couleur_hex: hex,
    couleurs_secondaires: [],
    style: ['casual'],
    saison: ['printemps', 'automne'],
    occasion: ['quotidien'],
    conseil_association: 'Associe cette pièce à un bas neutre pour la mettre en valeur.',
    _demo: true,
  }
}

function averageColor(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 24
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const { data } = ctx.getImageData(0, 0, size, size)
      let r = 0
      let g = 0
      let b = 0
      const n = data.length / 4
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      URL.revokeObjectURL(url)
      const toHex = (v) => Math.round(v / n).toString(16).padStart(2, '0')
      resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
    }
    img.onerror = () => resolve('#888888')
    img.src = url
  })
}

const NAMED = [
  ['Noir', [17, 17, 17]],
  ['Blanc', [245, 245, 240]],
  ['Gris', [136, 136, 136]],
  ['Beige', [217, 199, 168]],
  ['Rouge', [200, 40, 40]],
  ['Corail', [255, 107, 107]],
  ['Jaune', [232, 197, 71]],
  ['Vert', [107, 142, 35]],
  ['Menthe', [168, 230, 207]],
  ['Bleu', [74, 108, 140]],
  ['Marron', [138, 90, 43]],
  ['Rose', [255, 158, 196]],
]
function nearestColorName(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  let best = NAMED[0]
  let bestD = Infinity
  for (const [, rgb] of NAMED) void rgb
  for (const entry of NAMED) {
    const [, [pr, pg, pb]] = entry
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (d < bestD) {
      bestD = d
      best = entry
    }
  }
  return best[0]
}

export function useClaudeVision() {
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(file) {
    setAnalyzing(true)
    setError(null)
    try {
      if (isClaudeConfigured) {
        const result = await analyzeClothing(file)
        if (!result) throw new Error('Analyse impossible')
        return result
      }
      return await demoAnalyze(file)
    } catch (e) {
      setError(e.message)
      // Repli démo même si Claude échoue.
      return await demoAnalyze(file)
    } finally {
      setAnalyzing(false)
    }
  }

  return { analyze, analyzing, error, isConfigured: isClaudeConfigured }
}

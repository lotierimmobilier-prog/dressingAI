import { useMemo } from 'react'
import { buildVintedUrl, estimatePrice, suggestGaps } from '../lib/vintedUrl'

/** Petit hook utilitaire autour du générateur d'URLs Vinted. */
export function useVinted(dressing = []) {
  const gaps = useMemo(() => suggestGaps(dressing), [dressing])

  function searchFor(description, categorie, couleur) {
    return {
      url: buildVintedUrl({ description, categorie, couleur }),
      prix: estimatePrice(categorie),
    }
  }

  function open(description, categorie, couleur) {
    const { url } = searchFor(description, categorie, couleur)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return { gaps, searchFor, open }
}

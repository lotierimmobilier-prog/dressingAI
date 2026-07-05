/**
 * Générateur d'URLs de recherche Vinted intelligentes.
 * Vinted n'a pas d'API publique officielle : on construit une URL de recherche
 * texte + on estime une fourchette de prix locale par catégorie.
 */

const VINTED_BASE = 'https://www.vinted.fr/catalog'

// Mapping catégorie interne → mot-clé de recherche FR
const CATEGORY_KEYWORDS = {
  haut: 'haut',
  bas: 'pantalon',
  robe: 'robe',
  chaussures: 'chaussures',
  accessoire: 'accessoire',
  manteau: 'manteau',
}

// Fourchettes de prix indicatives (€) par catégorie sur le marché seconde main
const PRICE_RANGES = {
  haut: [8, 25],
  bas: [10, 30],
  robe: [12, 35],
  chaussures: [15, 45],
  accessoire: [5, 20],
  manteau: [20, 60],
}

/** Construit une URL de recherche Vinted à partir d'une description texte. */
export function buildVintedUrl({ description, categorie, couleur }) {
  const parts = [description, couleur, categorie && CATEGORY_KEYWORDS[categorie]]
    .filter(Boolean)
    .join(' ')
  const params = new URLSearchParams()
  params.set('search_text', parts)
  params.set('order', 'newest_first')
  return `${VINTED_BASE}?${params.toString()}`
}

/** Estime une fourchette de prix pour une catégorie donnée. */
export function estimatePrice(categorie) {
  const range = PRICE_RANGES[categorie] || [5, 30]
  return { min: range[0], max: range[1] }
}

/**
 * À partir d'un dressing, détecte les "trous" (catégories peu / non couvertes)
 * et propose des recherches Vinted pour les combler.
 */
export function suggestGaps(dressing) {
  const counts = { haut: 0, bas: 0, chaussures: 0, accessoire: 0, manteau: 0, robe: 0 }
  dressing.forEach((item) => {
    if (counts[item.categorie] !== undefined) counts[item.categorie] += 1
  })
  const essentials = [
    { categorie: 'haut', label: 'Un basique haut polyvalent', ideal: 4 },
    { categorie: 'bas', label: 'Un bas neutre passe-partout', ideal: 3 },
    { categorie: 'chaussures', label: 'Une paire de chaussures versatile', ideal: 2 },
    { categorie: 'accessoire', label: 'Un accessoire qui relève tout', ideal: 2 },
    { categorie: 'manteau', label: 'Une pièce de dessus pour la mi-saison', ideal: 1 },
  ]
  return essentials
    .filter((e) => counts[e.categorie] < e.ideal)
    .map((e) => ({
      ...e,
      manque: e.ideal - counts[e.categorie],
      prix: estimatePrice(e.categorie),
      url: buildVintedUrl({ description: e.label, categorie: e.categorie }),
    }))
    .slice(0, 3)
}

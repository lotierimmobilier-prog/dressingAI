/**
 * Moteur d'affiliation — construit des liens d'achat traqués vers les boutiques.
 *
 * Affiliation DIRECTE (sans intermédiaire payant type Awin). Les identifiants se
 * renseignent SANS coder depuis la page Monétisation (localStorage), avec repli
 * sur le .env :
 *   VITE_AMAZON_TAG   → tag Amazon Partenaires (ex: "dressingai-21")
 *   VITE_SHEIN_AFF    → paramètre de suivi Shein   (ex: "aff_id=12345")
 *   VITE_ZALANDO_AFF  → paramètre de suivi Zalando (ex: "wmc=abcde")
 *   VITE_ASOS_AFF     → paramètre de suivi ASOS    (ex: "affid=12345")
 */
import { buildVintedUrl } from './vintedUrl'
import { getAffiliateConfig } from './affiliateConfig'

const enc = (s) => encodeURIComponent(s || '')

/**
 * Query string de suivi à ajouter, à partir SOIT d'un paramètre "clé=valeur"
 * (ex: "aff_id=123"), SOIT d'un lien d'affiliation complet collé tel quel
 * (ex: "https://fr.shein.com/...?ref=6NU4K" → on récupère "ref=6NU4K").
 */
function trackingQuery(value) {
  const v = (value || '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) {
    try {
      return new URL(v).search.replace(/^\?/, '')
    } catch {
      return ''
    }
  }
  return v.replace(/^[?&]+/, '')
}

/** Ajoute le suivi d'affiliation à une URL de recherche boutique. */
function withParam(url, value) {
  const q = trackingQuery(value)
  if (!q) return url
  return `${url}${url.includes('?') ? '&' : '?'}${q}`
}

/**
 * Catalogue des boutiques : chaque entrée construit une URL de recherche,
 * enrobée d'affiliation quand c'est possible (config lue à chaque appel).
 */
export const RETAILERS = [
  {
    id: 'amazon',
    label: 'Amazon',
    color: '#FF9900',
    build: (q) => {
      const { amazonTag } = getAffiliateConfig()
      return `https://www.amazon.fr/s?k=${enc(q)}${amazonTag ? `&tag=${amazonTag}` : ''}`
    },
    affiliate: () => Boolean(getAffiliateConfig().amazonTag),
  },
  {
    id: 'shein',
    label: 'Shein',
    color: '#111111',
    build: (q) => withParam(`https://fr.shein.com/pdsearch/${enc(q)}`, getAffiliateConfig().shein),
    affiliate: () => Boolean(getAffiliateConfig().shein),
  },
  {
    id: 'zalando',
    label: 'Zalando',
    color: '#FF6900',
    build: (q) =>
      withParam(`https://www.zalando.fr/recherche/?q=${enc(q)}`, getAffiliateConfig().zalando),
    affiliate: () => Boolean(getAffiliateConfig().zalando),
  },
  {
    id: 'asos',
    label: 'ASOS',
    color: '#2D2D2D',
    build: (q) =>
      withParam(`https://www.asos.com/fr/recherche/?q=${enc(q)}`, getAffiliateConfig().asos),
    affiliate: () => Boolean(getAffiliateConfig().asos),
  },
  {
    id: 'google',
    label: 'Google Shopping',
    color: '#4285F4',
    build: (q) => `https://www.google.com/search?tbm=shop&q=${enc(q)}`,
    affiliate: () => false,
  },
  {
    id: 'vinted',
    label: 'Vinted (occasion)',
    color: '#09B1BA',
    build: (q) => buildVintedUrl({ description: q }),
    affiliate: () => false,
  },
]

/** True si au moins une boutique rapporte une commission (au moins un ID renseigné). */
export function hasAffiliate() {
  return RETAILERS.some((r) => r.affiliate())
}

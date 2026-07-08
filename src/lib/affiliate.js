/**
 * Moteur d'affiliation — construit des liens d'achat traqués vers les boutiques.
 *
 * Les identifiants d'affiliation sont configurables SANS coder depuis la page
 * Monétisation (localStorage), avec repli sur les variables .env :
 *   VITE_AMAZON_TAG   → Amazon Partenaires (ex: "dressingai-21")
 *   VITE_AWIN_ID      → ID éditeur Awin (Shein, Zalando, ASOS… via Awin)
 * Les IDs marchands Awin se renseignent aussi dans la page Monétisation.
 */
import { buildVintedUrl } from './vintedUrl'
import { getAffiliateConfig } from './affiliateConfig'

const enc = (s) => encodeURIComponent(s || '')

/** Enrobe une URL cible dans un lien traqué Awin si l'ID éditeur + le marchand sont dispo. */
function awin(mid, targetUrl) {
  const { awinId } = getAffiliateConfig()
  if (!awinId || !mid) return targetUrl
  return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${awinId}&ued=${enc(targetUrl)}`
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
    build: (q) => awin(getAffiliateConfig().awinMid.shein, `https://fr.shein.com/pdsearch/${enc(q)}`),
    affiliate: () => {
      const c = getAffiliateConfig()
      return Boolean(c.awinId && c.awinMid.shein)
    },
  },
  {
    id: 'zalando',
    label: 'Zalando',
    color: '#FF6900',
    build: (q) =>
      awin(getAffiliateConfig().awinMid.zalando, `https://www.zalando.fr/recherche/?q=${enc(q)}`),
    affiliate: () => {
      const c = getAffiliateConfig()
      return Boolean(c.awinId && c.awinMid.zalando)
    },
  },
  {
    id: 'asos',
    label: 'ASOS',
    color: '#2D2D2D',
    build: (q) =>
      awin(getAffiliateConfig().awinMid.asos, `https://www.asos.com/fr/recherche/?q=${enc(q)}`),
    affiliate: () => {
      const c = getAffiliateConfig()
      return Boolean(c.awinId && c.awinMid.asos)
    },
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

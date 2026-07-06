/**
 * Moteur d'affiliation — construit des liens d'achat traqués vers les boutiques.
 *
 * Les identifiants d'affiliation sont configurables (env) : les liens marchent
 * sans, mais ne rapportent une commission qu'une fois tes IDs renseignés.
 *   VITE_AMAZON_TAG   → Amazon Partenaires (ex: "dressingai-21")
 *   VITE_AWIN_ID      → ID éditeur Awin (Shein, Zalando, ASOS… via Awin)
 */
import { buildVintedUrl } from './vintedUrl'

const AMAZON_TAG = import.meta.env.VITE_AMAZON_TAG || ''
const AWIN_ID = import.meta.env.VITE_AWIN_ID || ''

const enc = (s) => encodeURIComponent(s || '')

/** Enrobe une URL cible dans un lien traqué Awin si l'ID + le merchant sont dispo. */
function awin(mid, targetUrl) {
  if (!AWIN_ID || !mid) return targetUrl
  return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AWIN_ID}&ued=${enc(targetUrl)}`
}

// Merchant IDs Awin (à ajuster selon ton compte : ce sont des exemples courants FR).
const AWIN_MID = {
  shein: '', // ex: '16994' — renseigne le tien depuis ton dashboard Awin
  zalando: '',
  asos: '',
}

/**
 * Catalogue des boutiques : chaque entrée construit une URL de recherche,
 * enrobée d'affiliation quand c'est possible.
 */
export const RETAILERS = [
  {
    id: 'amazon',
    label: 'Amazon',
    color: '#FF9900',
    build: (q) =>
      `https://www.amazon.fr/s?k=${enc(q)}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ''}`,
    affiliate: () => Boolean(AMAZON_TAG),
  },
  {
    id: 'shein',
    label: 'Shein',
    color: '#111111',
    build: (q) => awin(AWIN_MID.shein, `https://fr.shein.com/pdsearch/${enc(q)}`),
    affiliate: () => Boolean(AWIN_ID && AWIN_MID.shein),
  },
  {
    id: 'zalando',
    label: 'Zalando',
    color: '#FF6900',
    build: (q) => awin(AWIN_MID.zalando, `https://www.zalando.fr/recherche/?q=${enc(q)}`),
    affiliate: () => Boolean(AWIN_ID && AWIN_MID.zalando),
  },
  {
    id: 'asos',
    label: 'ASOS',
    color: '#2D2D2D',
    build: (q) => awin(AWIN_MID.asos, `https://www.asos.com/fr/recherche/?q=${enc(q)}`),
    affiliate: () => Boolean(AWIN_ID && AWIN_MID.asos),
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
export const hasAffiliate = RETAILERS.some((r) => r.affiliate())

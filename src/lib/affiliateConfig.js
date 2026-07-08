/**
 * Configuration d'affiliation éditable SANS coder, depuis la page Monétisation.
 * Affiliation DIRECTE (pas d'intermédiaire type Awin) : pour chaque boutique on
 * stocke le paramètre de suivi fourni par son programme d'affiliation
 * (ex. Amazon → tag ; Shein/Zalando/ASOS → "aff_id=12345", "wmc=abc"…).
 * Les valeurs saisies dans l'app priment sur les variables d'environnement (.env).
 */
const KEY = 'dressingai.affiliate'

const ENV_DEFAULTS = {
  amazonTag: import.meta.env.VITE_AMAZON_TAG || '',
  shein: import.meta.env.VITE_SHEIN_AFF || '',
  zalando: import.meta.env.VITE_ZALANDO_AFF || '',
  asos: import.meta.env.VITE_ASOS_AFF || '',
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') || {}
  } catch {
    return {}
  }
}

/** Config effective = ce qui est saisi dans l'app, sinon le .env. */
export function getAffiliateConfig() {
  const s = readStored()
  return {
    amazonTag: s.amazonTag || ENV_DEFAULTS.amazonTag,
    shein: s.shein || ENV_DEFAULTS.shein,
    zalando: s.zalando || ENV_DEFAULTS.zalando,
    asos: s.asos || ENV_DEFAULTS.asos,
  }
}

/** Enregistre la config saisie dans la page Monétisation. */
export function saveAffiliateConfig(cfg) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    /* stockage indisponible : on ignore silencieusement */
  }
}

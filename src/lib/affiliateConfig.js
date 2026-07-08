/**
 * Configuration d'affiliation éditable SANS coder, depuis la page Monétisation.
 * Les valeurs saisies sont stockées en localStorage et priment sur les variables
 * d'environnement (.env). Un champ laissé vide retombe sur la valeur du .env.
 */
const KEY = 'dressingai.affiliate'

const ENV_DEFAULTS = {
  amazonTag: import.meta.env.VITE_AMAZON_TAG || '',
  awinId: import.meta.env.VITE_AWIN_ID || '',
  awinMid: { shein: '', zalando: '', asos: '' },
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
  const mid = s.awinMid || {}
  return {
    amazonTag: s.amazonTag || ENV_DEFAULTS.amazonTag,
    awinId: s.awinId || ENV_DEFAULTS.awinId,
    awinMid: {
      shein: mid.shein || ENV_DEFAULTS.awinMid.shein,
      zalando: mid.zalando || ENV_DEFAULTS.awinMid.zalando,
      asos: mid.asos || ENV_DEFAULTS.awinMid.asos,
    },
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

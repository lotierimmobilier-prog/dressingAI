/**
 * Contrôle d'accès admin.
 *
 * Seuls les comptes « admin » (ex. Juliette) voient les réglages d'affiliation /
 * monétisation. Les autres ont une version épurée : aucun lien ni accès à ces
 * réglages (route protégée en plus du masquage des liens).
 *
 * Les emails admin se configurent SANS coder via VITE_ADMIN_EMAILS (liste
 * séparée par des virgules). À défaut, on retombe sur le compte propriétaire.
 */
const DEFAULT_ADMINS = ['lotierimmobilier@gmail.com']

const CONFIGURED = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const ADMINS = CONFIGURED.length ? CONFIGURED : DEFAULT_ADMINS

/** True si l'email fait partie des admins. */
export function isAdminEmail(email) {
  return Boolean(email) && ADMINS.includes(email.toLowerCase())
}

/** True si l'utilisateur connecté est admin. */
export function isAdminUser(user) {
  return isAdminEmail(user?.email)
}

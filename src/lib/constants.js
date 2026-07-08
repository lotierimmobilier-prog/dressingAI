// Humeurs du jour — pilotent la teinte du miroir sur la home.
export const MOODS = [
  { id: 'decontracte', label: 'Décontracté', emoji: '😎', tint: '#A8E6CF', hint: 'casual, léger, cool' },
  { id: 'pro', label: 'Mode Pro', emoji: '💼', tint: '#7FA6C9', hint: 'chic, structuré, sobre' },
  { id: 'festif', label: 'Festif', emoji: '🎉', tint: '#E8C547', hint: 'brillant, doré, fun' },
  { id: 'zen', label: 'Zen / Nature', emoji: '🌿', tint: '#8FD4A8', hint: 'naturel, apaisé, boho' },
  { id: 'dark', label: 'Dark Mood', emoji: '🖤', tint: '#5B5B6B', hint: 'noir, minimal, edgy' },
  { id: 'feelgood', label: 'Feel Good', emoji: '🌸', tint: '#FF9EC4', hint: 'coloré, doux, joyeux' },
  { id: 'move', label: 'En mouvement', emoji: '🏃', tint: '#5BC0DE', hint: 'sport, dynamique, technique' },
  { id: 'shine', label: 'Je veux briller', emoji: '🤩', tint: '#FF6B6B', hint: 'statement, audacieux' },
]

export const CATEGORIES = [
  { id: 'haut', label: 'Hauts', emoji: '👕' },
  { id: 'bas', label: 'Bas', emoji: '👖' },
  { id: 'robe', label: 'Robes', emoji: '👗' },
  { id: 'chaussures', label: 'Chaussures', emoji: '👟' },
  { id: 'accessoire', label: 'Accessoires', emoji: '🧣' },
  { id: 'manteau', label: 'Manteaux', emoji: '🧥' },
]

export const STYLES = ['Casual', 'Chic', 'Streetwear', 'Vintage', 'Sport', 'Boho', 'Minimaliste']

export const SAISONS = ['printemps', 'été', 'automne', 'hiver']
export const OCCASIONS = ['quotidien', 'travail', 'soirée', 'sport', 'cérémonie']

export const TAGS = [
  { id: 'favori', label: 'Favori', emoji: '⭐' },
  { id: 'en_pret', label: 'En prêt', emoji: '🔄' },
  { id: 'stocke', label: 'Stocké', emoji: '📦' },
  { id: 'a_donner', label: 'À donner', emoji: '🗑️' },
]

// Palette utilisée par la roue de couleurs de l'onboarding.
export const COLOR_WHEEL = [
  '#0D0D0D', '#F5F5F0', '#E8C547', '#FF6B6B', '#A8E6CF', '#7FA6C9',
  '#C56B4A', '#8A5A2B', '#4A6C8C', '#FF9EC4', '#5BC0DE', '#B39DDB',
  '#D9C7A8', '#6B8E23', '#800020', '#2E2E2E',
]

// --- Gamification ---
export const POINTS = {
  ADD_CLOTHING: 10,
  WEAR_OUTFIT: 5,
  AI_VALIDATED_LOOK: 20,
  SHARE_LOOK: 15,
}

export const BADGES = [
  { id: 'first_look', label: 'First Look', emoji: '🎬', desc: 'Ta première tenue enregistrée' },
  { id: 'fashionista', label: 'Fashionista', emoji: '👑', desc: '50 vêtements dans le dressing' },
  { id: 'ecolo_chic', label: 'Ecolo Chic', emoji: '🌱', desc: '0 achat pendant 30 jours' },
  { id: 'coloriste', label: 'Coloriste', emoji: '🎨', desc: '7 couleurs portées en 7 jours' },
  { id: 'styliste', label: 'Styliste', emoji: '✨', desc: 'Un look validé >80% par l’IA' },
]

// Niveaux : seuils de points cumulés.
export const LEVELS = [
  { level: 1, min: 0, title: 'Apprenti·e Style' },
  { level: 2, min: 100, title: 'Amateur·rice Éclairé·e' },
  { level: 3, min: 250, title: 'Fashion Curator' },
  { level: 4, min: 500, title: 'Icône Montante' },
  { level: 5, min: 1000, title: 'Légende du Dressing' },
]

export function levelFromPoints(points) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) if (points >= lvl.min) current = lvl
  const next = LEVELS.find((l) => l.min > points)
  const progress = next
    ? (points - current.min) / (next.min - current.min)
    : 1
  return { ...current, next, progress: Math.min(1, progress) }
}

// Couleur tendance de la semaine ("Couleur du Moment").
export const COULEUR_DU_MOMENT = {
  nom: 'Jaune Moutarde Lumineux',
  hex: '#E8C547',
  semaine: 'Semaine du 30 juin',
  note: 'La couleur qui réveille tes basiques et capte la lumière d’été.',
}

// Motif tendance ("Motif du Moment") — basé sur les tendances imprimés
// Été 2026 (défilés + presse mode) : le vichy fait son grand retour.
export const MOTIF_DU_MOMENT = {
  nom: 'Vichy (gingham)',
  saison: 'Tendance Été 2026',
  note: 'Le grand retour de l’été : robes, tops et jupes légères façon pique-nique chic.',
  recherche: 'robe vichy',
  alternatives: ['Pois', 'Rayures', 'Fleurs aquarelle', 'Carreaux/Plaid'],
  // Aperçu du motif rendu en CSS (pas d’image).
  pattern: {
    backgroundColor: '#F5F5F0',
    backgroundImage:
      'linear-gradient(rgba(255,107,107,0.55) 50%, transparent 50%), linear-gradient(90deg, rgba(255,107,107,0.55) 50%, transparent 50%)',
    backgroundSize: '9px 9px',
  },
}

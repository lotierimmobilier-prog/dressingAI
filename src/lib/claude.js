/**
 * Wrapper autour de l'API Anthropic Claude.
 *
 * ⚠️ Sécurité : appeler l'API Anthropic directement depuis le navigateur
 * expose ta clé. En production, remplace `callClaude` par un appel vers ta
 * propre fonction serveur (Supabase Edge Function / route API) qui relaie la
 * requête. Le code ci-dessous supporte les deux :
 *   - si VITE_ANTHROPIC_API_KEY est présent → appel direct (dev/démo)
 *   - sinon → mode démo avec réponses simulées.
 */

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL = import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'

export const isClaudeConfigured = Boolean(API_KEY)

/** Extrait le premier objet JSON valide d'un texte (Claude renvoie parfois du markdown). */
export function extractJSON(text) {
  if (!text) return null
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
}

async function callClaude({ system, content, maxTokens = 1024 }) {
  if (!isClaudeConfigured) throw new Error('Claude non configuré')
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content }],
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Claude API ${res.status}: ${detail}`)
  }
  const data = await res.json()
  return data?.content?.[0]?.text ?? ''
}

/** Convertit une image (File/Blob) en bloc content base64 pour Claude Vision. */
async function fileToImageBlock(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  const base64 = btoa(binary)
  return {
    type: 'image',
    source: {
      type: 'base64',
      media_type: file.type || 'image/jpeg',
      data: base64,
    },
  }
}

const VISION_PROMPT = `Analyze this clothing item photo precisely. Return ONLY a valid JSON object with these fields: { "nom": "description courte en français (ex: Chemise lin beige)", "categorie": "haut|bas|robe|chaussures|accessoire|manteau", "couleur_dominante": "nom couleur en français", "couleur_hex": "#XXXXXX", "couleurs_secondaires": ["couleur1", "couleur2"], "style": ["casual","chic","sport","soirée","vintage","streetwear"], "saison": ["printemps","été","automne","hiver"], "occasion": ["quotidien","travail","soirée","sport","cérémonie"], "conseil_association": "Une phrase sur comment bien porter cette pièce" } No explanation, no markdown, only the JSON.`

/** Auto-tag d'un vêtement à partir d'une photo. */
export async function analyzeClothing(file) {
  const imageBlock = await fileToImageBlock(file)
  const text = await callClaude({
    content: [imageBlock, { type: 'text', text: VISION_PROMPT }],
    maxTokens: 700,
  })
  return extractJSON(text)
}

/** Suggère 3 tenues depuis le dressing selon l'humeur / météo / palette. */
export async function suggestOutfits({ dressing, humeur, temp, condition, couleurs }) {
  const prompt = `Tu es un styliste expert. L'utilisateur a ces vêtements disponibles : ${JSON.stringify(
    dressing,
  )}. Son humeur du jour : ${humeur}. La météo actuelle : ${temp}°C, ${condition}. Sa palette couleur du jour : ${JSON.stringify(
    couleurs,
  )}.
Propose 3 tenues complètes en utilisant UNIQUEMENT les vêtements listés (par leur id). Return ONLY JSON: { "tenues": [ { "nom": "Nom créatif de la tenue", "haut_id": "uuid|null", "bas_id": "uuid|null", "chaussures_id": "uuid|null", "accessoire_id": "uuid|null", "score_coherence": 85, "description_look": "Phrase courte et fun décrivant le vibe", "emoji_look": "🔥", "pieces_manquantes": ["description pièce manquante 1"] } ] }`
  const text = await callClaude({ content: prompt, maxTokens: 1400 })
  return extractJSON(text)
}

/** Analyse "Style Twin" de toute la garde-robe. */
export async function analyzeStyleTwin(dressing) {
  const prompt = `Analyse cette garde-robe complète : ${JSON.stringify(
    dressing,
  )} Identifie l'identité style unique de cette personne. Return ONLY JSON: { "titre_style": "Ex: La Parisienne Urbaine qui voyage", "description": "2-3 phrases fun et flatteuses", "influences": ["Influence 1", "Influence 2", "Influence 3"], "palette_signature": ["#hex1", "#hex2", "#hex3"], "conseil_signature": "Un conseil personnalisé", "celebrite_style": "Célébrité avec style similaire" }`
  const text = await callClaude({ content: prompt, maxTokens: 800 })
  return extractJSON(text)
}

/** Évalue la cohérence d'une tenue composée manuellement. */
export async function evaluateOutfit(pieces) {
  const prompt = `Tu es un styliste. Évalue la cohérence de cette tenue : ${JSON.stringify(
    pieces,
  )}. Return ONLY JSON: { "score": 0-100, "verdict": "Une phrase punchy", "point_fort": "...", "amelioration": "Une suggestion concrète", "emoji": "✨" }`
  const text = await callClaude({ content: prompt, maxTokens: 500 })
  return extractJSON(text)
}

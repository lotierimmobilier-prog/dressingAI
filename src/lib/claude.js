/**
 * Wrapper autour de l'API Anthropic Claude.
 *
 * Trois modes, par ordre de préférence :
 *   1. PROXY (recommandé, sécurisé) : VITE_CLAUDE_PROXY=1 + Supabase configuré
 *      → appel à l'Edge Function `claude` (la clé Anthropic reste côté serveur).
 *   2. DIRECT (rapide mais moins sûr) : VITE_ANTHROPIC_API_KEY présent
 *      → appel direct au navigateur (la clé est exposée dans le bundle).
 *   3. DÉMO : rien de configuré → réponses simulées locales (voir hooks).
 */
import { supabase, isSupabaseConfigured } from './supabase'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL = import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_ENABLED = import.meta.env.VITE_CLAUDE_PROXY === '1' && isSupabaseConfigured

export const isClaudeConfigured = Boolean(API_KEY) || PROXY_ENABLED

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
  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content }],
  }

  // 1. Proxy Edge Function (clé Anthropic côté serveur).
  if (PROXY_ENABLED && supabase) {
    const { data, error } = await supabase.functions.invoke('claude', { body })
    if (error) throw new Error(`Proxy Claude: ${error.message}`)
    if (data?.error) throw new Error(`Proxy Claude: ${data.error}`)
    return data?.content?.[0]?.text ?? ''
  }

  // 2. Appel direct (clé exposée au navigateur).
  if (API_KEY) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`Claude API ${res.status}: ${detail}`)
    }
    const data = await res.json()
    return data?.content?.[0]?.text ?? ''
  }

  throw new Error('Claude non configuré')
}

/**
 * Convertit une image (File/Blob) en bloc content base64 pour Claude Vision.
 * L'image est redimensionnée (max 1024px, JPEG) pour réduire le poids et le coût.
 */
function fileToImageBlock(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const max = 1024
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: dataUrl.split(',')[1] },
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    img.src = url
  })
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

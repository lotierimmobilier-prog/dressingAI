// ============================================================
//  Edge Function "claude" — proxy sécurisé vers l'API Anthropic
//  La clé ANTHROPIC_API_KEY reste côté serveur (secret Supabase),
//  jamais exposée dans le bundle du navigateur.
//
//  Déploiement :
//    supabase functions deploy claude
//    supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//  (ou via le dashboard Supabase → Edge Functions)
// ============================================================

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY manquant (secret Supabase non défini)')
    }

    // Le corps est déjà au format API Anthropic { model, max_tokens, system, messages }.
    const body = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...cors, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...cors, 'content-type': 'application/json' },
    })
  }
})

# DressingAI 👗✨

**Ta garde-robe intelligente, sublimée par l'IA.** Un gestionnaire de dressing
qui ressemble à un magazine de mode vivant : compose des tenues, suis la météo,
et brille chaque jour.

Application **React + Vite** avec une identité visuelle unique (miroir de dressing
animé), propulsée par **Supabase**, **Claude (vision + styliste)** et
**OpenWeatherMap**.

> 🎭 **Mode démo intégré** : l'app tourne immédiatement, sans aucune clé, avec un
> dressing de démonstration et des suggestions générées localement. Ajoute tes
> clés API pour débloquer la synchronisation, l'analyse photo IA et la météo réelle.

---

## 🚀 Démarrage

```bash
npm install
cp .env.example .env.local   # (optionnel) renseigne tes clés
npm run dev
```

Ouvre http://localhost:5173 → clique **« Explorer en mode démo »**.

### Build de production

```bash
npm run build && npm run preview
```

---

## 🔑 Configuration (`.env.local`)

| Variable | Rôle | Sans la clé |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Auth, base de données, storage photos | Mode démo (localStorage) |
| `VITE_ANTHROPIC_API_KEY` | Claude Vision (auto-tag) + styliste IA | Analyse couleur locale + moteur de tenues local |
| `VITE_CLAUDE_MODEL` | Modèle Claude (défaut `claude-sonnet-4-6`) | — |
| `VITE_OPENWEATHER_API_KEY` | Météo géolocalisée + prévisions | Météo démo (Paris) |

> ⚠️ **Sécurité** : les appels Claude/Anthropic depuis le navigateur exposent la
> clé. En production, proxifie-les via une **Supabase Edge Function** ou une route
> serveur. Le wrapper `src/lib/claude.js` est prêt à être basculé vers un proxy.

### Base de données Supabase

Exécute [`supabase/schema.sql`](supabase/schema.sql) dans l'éditeur SQL Supabase.
Il crée les tables (`user_profiles`, `vetements`, `tenues`, `historique_ports`,
`dressing_partages`), les policies **RLS**, le bucket storage `vetements`, et un
trigger qui crée le profil à l'inscription.

---

## ✨ Fonctionnalités

- **Auth & onboarding** en 4 étapes animées (prénom+avatar, styles, couleurs
  fétiches, budget).
- **Mon dressing** — upload photo → **auto-tag Claude Vision**, correction
  manuelle, tags (⭐ favori, 🔄 prêt, 📦 stocké, 🗑️ à donner), filtres, et 3 vues
  (Grille / Placard / Lookbook).
- **Home « miroir magique »** — fond miroir animé qui **change de teinte selon
  l'humeur**, météo géolocalisée, palette du jour, et 3 tenues suggérées par l'IA.
- **Builder** — mode *Composer* (zones Haut/Bas/Chaussures/Accessoire + avis IA)
  et mode *Photo Scan* (analyse d'une pièce → 3 combinaisons).
- **Random Outfit Machine** 🎰 — vraie slot machine 3 rouleaux + son Web Audio +
  re-spin x3/jour.
- **Historique & stats** — calendrier, podium des plus portés, « Réveille-les ! »
  (60j+), donut couleurs, score de versatilité, coût au port, **Bilan Mode**
  partageable.
- **Style Twin** 🪞 — ton alter ego style analysé depuis toute la garde-robe.
- **Capsule Wardrobe** 🧳 — 10 pièces essentielles → X tenues possibles.
- **Ma semaine** 🗓️ — prévisions 7 jours + tenue par jour (carousel).
- **Recherche Vinted** 🛍️ — détection des trous du dressing + URLs de recherche
  intelligentes + fourchettes de prix.
- **Gamification** — points, niveaux, badges déblocables, barre de progression.
- **Dressing partagé** — invitation par email, badge couleur par membre.
- **PWA** — installable sur mobile (manifest + service worker).

---

## 🎨 Identité visuelle

- **Couleurs** : noir profond `#0D0D0D`, jaune moutarde `#E8C547`, corail `#FF6B6B`,
  menthe `#A8E6CF`, crème `#F5F5F0`.
- **Typo** : Unbounded (titres), DM Sans (texte), DM Mono (données).
- **Signature** : le miroir animé ([`MirrorBackground`](src/components/layout/MirrorBackground.jsx)),
  transitions « tissu qui tombe », cards 3D au survol, confetti aux couleurs du
  vêtement ajouté.

---

## 📁 Structure

```
src/
├── components/  ui · wardrobe · outfit · stats · vinted · layout
├── pages/       Home · Dressing · Builder · Historique · StyleTwin · Capsule · Semaine · Profil · Auth · Onboarding
├── stores/      authStore · wardrobeStore · outfitStore   (Zustand)
├── hooks/       useWeather · useClaudeVision · useVinted · useGameification
└── lib/         supabase · claude · vintedUrl · outfitEngine · stats · colors · constants · demoData
```

---

## 🧱 Stack

React 18 · Vite · TailwindCSS · Framer Motion · Zustand · React Query ·
React Router v6 · Lucide · Supabase · Anthropic Claude · OpenWeatherMap · vite-plugin-pwa.

*UI en français. Fait pour être beau, unique et fun.*

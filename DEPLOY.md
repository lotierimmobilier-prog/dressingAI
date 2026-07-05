# Déployer Dressify sur ton VPS 🚀

Dressify est une **SPA Vite** : elle se compile en fichiers statiques (`dist/`)
que n'importe quel serveur web sert. Choisis **une** des méthodes ci-dessous.

> Le dépôt : `https://github.com/lotierimmobilier-prog/dressingAI`
> Branche : `claude/dressify-app-4suzj1` (branche par défaut du repo).

> ⚠️ Les clés `VITE_*` sont **figées au moment du build**. Renseigne-les *avant*
> de builder (via `.env` / build-args), sinon l'app démarre en **mode démo**.

---

## Prérequis sur le VPS

```bash
# Créer le dossier de l'app dans ton home
mkdir -p ~/dressingAI && cd ~/dressingAI

# Cloner le projet dans ce dossier
git clone https://github.com/lotierimmobilier-prog/dressingAI.git .
# (dépôt privé → utilise un token/clé SSH GitHub)
```

---

## Méthode A — Docker (recommandée, la plus simple)

Prérequis : Docker + Docker Compose sur le VPS.

```bash
cd ~/dressingAI

# 1. (optionnel) Renseigne tes clés pour le mode complet
cat > .env <<'EOF'
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ANTHROPIC_API_KEY=...
VITE_OPENWEATHER_API_KEY=...
EOF

# 2. Build + lancement
docker compose up -d --build
```

➡️ App servie sur `http://IP_DU_VPS:8080` (modifie le port dans
`docker-compose.yml`). Mets un reverse proxy (nginx/Caddy/Traefik) devant pour
le domaine + HTTPS.

Mise à jour :
```bash
cd ~/dressingAI && git pull && docker compose up -d --build
```

---

## Méthode B — nginx sur l'hôte (sans Docker)

Prérequis : Node 20+ et nginx sur le VPS.

```bash
cd ~/dressingAI

# Renseigne les clés si besoin
cp .env.example .env.local && nano .env.local

# Build
npm ci && npm run build       # génère ./dist

# Configure nginx (voir deploy/dressify.site.conf)
sudo cp deploy/dressify.site.conf /etc/nginx/sites-available/dressify
sudo nano /etc/nginx/sites-available/dressify   # adapte server_name + root=~/dressingAI/dist
sudo ln -s /etc/nginx/sites-available/dressify /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Un script tout-en-un est fourni : `./deploy/deploy.sh` (pull + install + build).

HTTPS : `sudo certbot --nginx -d ton-domaine.com`.

---

## Méthode C — Aperçu rapide (test)

```bash
cd ~/dressingAI && npm ci && npm run build
npx serve -s dist -l 8080      # ou: npm run preview -- --host --port 8080
```

---

## Après déploiement — activer le mode complet

1. **Supabase** : crée un projet, exécute [`supabase/schema.sql`](supabase/schema.sql)
   dans l'éditeur SQL, récupère l'URL + la clé anon.
2. **Claude** : clé API Anthropic. ⚠️ En prod, proxifie via une Edge Function
   Supabase pour ne pas exposer la clé (voir `src/lib/claude.js`).
3. **OpenWeatherMap** : clé gratuite.
4. Renseigne ces valeurs dans `.env` (Docker) ou `.env.local` (nginx) puis
   **rebuild**.

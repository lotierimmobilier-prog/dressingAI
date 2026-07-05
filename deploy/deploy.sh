#!/usr/bin/env bash
# Déploie / met à jour DressingAI sur le VPS (build statique).
# Usage :  ./deploy/deploy.sh
set -euo pipefail

BRANCH="${DRESSINGAI_BRANCH:-claude/dressify-app-4suzj1}"
cd "$(dirname "$0")/.."

echo "▶ Récupération de la dernière version ($BRANCH)…"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "▶ Installation des dépendances…"
npm ci

echo "▶ Build de production…"
npm run build

echo "✅ Build prêt dans ./dist"
echo "   Sers ce dossier avec nginx (deploy/dressingai.site.conf) ou :"
echo "   npx serve -s dist -l 8080"

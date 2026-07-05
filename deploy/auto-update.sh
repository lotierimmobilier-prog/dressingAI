#!/usr/bin/env bash
# ============================================================
#  Auto-update DressingAI sur le VPS.
#  Lancé par cron : vérifie GitHub et rebuild SEULEMENT s'il y a du nouveau.
#  Installe la tâche cron avec (une seule fois) :
#    ( crontab -l 2>/dev/null; echo "*/5 * * * * /root/dressingAI/deploy/auto-update.sh >> /root/dressingAI/auto-update.log 2>&1" ) | crontab -
# ============================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

APP_DIR="${DRESSINGAI_DIR:-/root/dressingAI}"
BRANCH="${DRESSINGAI_BRANCH:-claude/dressify-app-4suzj1}"

cd "$APP_DIR" || exit 0

git fetch origin "$BRANCH" --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "$(date '+%F %T') : déjà à jour ($LOCAL)."
  exit 0
fi

echo "$(date '+%F %T') : nouvelle version → mise à jour…"
git pull --ff-only origin "$BRANCH"
docker compose up -d --build
echo "$(date '+%F %T') : ✅ mise à jour terminée ($(git rev-parse --short HEAD))."

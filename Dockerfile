# ===== Étape 1 : build de l'app Vite =====
FROM node:22-alpine AS build
WORKDIR /app

# Dépendances (cache Docker efficace)
COPY package*.json ./
RUN npm ci

# Variables VITE_ injectées AU BUILD (Vite les fige dans le bundle).
# Passe-les via --build-arg ou docker-compose. Vides = mode démo.
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_ANTHROPIC_API_KEY=""
ARG VITE_CLAUDE_MODEL="claude-sonnet-5"
ARG VITE_OPENWEATHER_API_KEY=""
ARG VITE_CLAUDE_PROXY=""
ARG VITE_BASE="/"
ARG VITE_AMAZON_TAG=""
ARG VITE_SHEIN_AFF=""
ARG VITE_ZALANDO_AFF=""
ARG VITE_ASOS_AFF=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ANTHROPIC_API_KEY=$VITE_ANTHROPIC_API_KEY \
    VITE_CLAUDE_MODEL=$VITE_CLAUDE_MODEL \
    VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY \
    VITE_CLAUDE_PROXY=$VITE_CLAUDE_PROXY \
    VITE_BASE=$VITE_BASE \
    VITE_AMAZON_TAG=$VITE_AMAZON_TAG \
    VITE_SHEIN_AFF=$VITE_SHEIN_AFF \
    VITE_ZALANDO_AFF=$VITE_ZALANDO_AFF \
    VITE_ASOS_AFF=$VITE_ASOS_AFF

COPY . .
RUN npm run build

# ===== Étape 2 : service statique via nginx =====
FROM nginx:alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]

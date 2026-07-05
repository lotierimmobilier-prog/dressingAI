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
ARG VITE_CLAUDE_MODEL="claude-sonnet-4-6"
ARG VITE_OPENWEATHER_API_KEY=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_ANTHROPIC_API_KEY=$VITE_ANTHROPIC_API_KEY \
    VITE_CLAUDE_MODEL=$VITE_CLAUDE_MODEL \
    VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY

COPY . .
RUN npm run build

# ===== Étape 2 : service statique via nginx =====
FROM nginx:alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]

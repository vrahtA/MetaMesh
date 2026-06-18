# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install root deps (server dependencies)
COPY package*.json .npmrc ./
RUN npm ci

# Install types deps (required by server compilation)
COPY types/package.json ./types/
RUN cd types && npm install

# Copy source
COPY types/ ./types/
COPY server/ ./server/

# Compile TypeScript server → server/lib/
RUN cd server && npx tsc --project tsconfig.server.json

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

# Only install production deps
COPY package*.json .npmrc ./
RUN npm ci --omit=dev

# Copy compiled output and shared types
COPY --from=builder /app/server/lib ./server/lib
COPY --from=builder /app/types ./types

# Colyseus monitor serves static assets from node_modules at runtime,
# so node_modules must stay.  PORT is injected by Railway automatically.
EXPOSE 2567

CMD ["node", "server/lib/index.js"]

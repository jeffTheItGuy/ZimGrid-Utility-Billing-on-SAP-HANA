# ── Build stage ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Create group 3000 (matches Helm runAsGroup) and add existing 'node' user to it
RUN addgroup -g 3000 -S appgroup && \
    addgroup node appgroup && \
    mkdir -p /tmp /.cache && \
    chown -R node:appgroup /app /tmp /.cache

# Copy only production artifacts
COPY --from=builder --chown=node:appgroup /app/dist ./dist
COPY --from=builder --chown=node:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=node:appgroup /app/package*.json ./

USER node

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
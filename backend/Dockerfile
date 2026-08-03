# ── Build stage ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Fallback to npm install if you haven't committed package-lock.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Non-root user (matches your Helm securityContext)
RUN addgroup -g 3000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup && \
    mkdir -p /tmp /.cache && \
    chown -R appuser:appgroup /app /tmp /.cache

# Copy only what the app needs to run
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

USER appuser

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["npm", "start"]
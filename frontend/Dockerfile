# syntax=docker/dockerfile:1

# ── Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests explicitly (lockfile is optional at copy time)
COPY package.json package-lock.json* ./

# Use npm ci when lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Inject API URL at build time so Vite embeds it in the JS bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Serve stage ─────────────────────────────────────────────
FROM nginx:alpine

# Remove default nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf 2>/dev/null || true

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Allow non-root user (UID 101) to read assets and write temp files
RUN chown -R 101:101 /usr/share/nginx/html /tmp /var/cache/nginx

EXPOSE 80
# syntax=docker/dockerfile:1

# ── Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject the API URL at build time so Vite bakes it into the bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ── Serve stage ─────────────────────────────────────────────
FROM nginx:alpine

# Remove default config so nginx only uses our custom one
RUN rm /etc/nginx/conf.d/default.conf 2>/dev/null || true

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Allow non-root user (UID 101) to read assets and write temp files
RUN chown -R 101:101 /usr/share/nginx/html /tmp /var/cache/nginx

EXPOSE 80
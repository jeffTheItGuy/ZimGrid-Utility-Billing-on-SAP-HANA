# backend/Dockerfile
# Build command (run from repo root):
#   docker build -f backend/Dockerfile -t zesa-billing-backend:latest .
#

###################
# Stage 1: Build  #
###################
FROM node:20-alpine AS builder

WORKDIR /build

# Install all dependencies (includes devDependencies for tsc)
COPY backend/package*.json ./
RUN npm ci

# Copy TypeScript source and config
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Compile to dist/
RUN npm run build

###################
# Stage 2: Production
###################
FROM node:20-alpine AS runner

# Create appgroup (GID 3000) to match Helm securityContext runAsGroup: 3000
# The official node image already provides 'node' user (UID 1000)
RUN addgroup -g 3000 -S appgroup && \
    addgroup node appgroup

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application
COPY --from=builder /build/dist ./dist

# Copy migrations into the path expected by run-migration.js default:
# __dirname (/app/dist/jobs) + ../../db/migrations = /app/db/migrations
COPY migrations ./db/migrations

# Copy utility scripts (hana tests, seeders, DBA scripts, etc.)
COPY scripts ./scripts

# Ensure ownership matches Helm securityContext (runAsUser:1000, runAsGroup:3000)
RUN chown -R node:appgroup /app

USER node:appgroup

EXPOSE 4000

ENV NODE_ENV=production \
    PORT=4000

CMD ["node", "dist/server.js"]
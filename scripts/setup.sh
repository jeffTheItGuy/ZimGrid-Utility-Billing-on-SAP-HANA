#!/bin/bash
# ============================================================
# ZimGrid — One-Command Setup
# ============================================================

set -e

echo "🚀 ZimGrid Setup"
echo "=================="

# 1. Environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env from template..."
    cp .env.example .env
fi

# 2. Clean start
echo "🧹 Cleaning old containers..."
docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true

# 3. Build and start
echo "🏗️  Building containers..."
docker compose -f docker-compose.dev.yml up --build -d

# 4. Wait for database
echo "⏳ Waiting for PostgreSQL..."
sleep 8

# 5. Seed data (RUN INSIDE THE BACKEND CONTAINER)
echo "🌱 Seeding demo data..."
docker exec zimgrid-backend npx tsx scripts/seed-demo-data.ts

echo ""
echo "✅ ZimGrid is running!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  API:       http://localhost:4000/api/v1/health"
echo ""
echo "  To stop:     docker-compose -f docker-compose.dev.yml down"
echo "  To view logs: docker-compose -f docker-compose.dev.yml logs -f"
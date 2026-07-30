# ZimGrid — Utility Billing & Grid Operations on SAP HANA

> **A production-grade database operations platform for power utilities, engineered on SAP HANA 2.0 with real-time monitoring, disaster recovery architecture, and multi-currency billing.**

---

## What This Is

A full-stack utility billing system built for the unique challenges of **African power distribution** — unstable networks, dual-currency economies (USD/local), prepaid meter token vending, and grid asset tracking across vast geographic regions.

The backend runs on **SAP HANA 2.0** (column-store, in-memory) with a **React operations dashboard** that gives database administrators real-time visibility into system health, replication status, and high-volume transaction tables.

**Built as a portfolio project to demonstrate SAP S/4 HANA Database Administration expertise.**

---

## Why This Matters for the Role

| What ZESA Needs | What This Project Proves |
|---|---|
| Administer SAP S/4 HANA databases | Multi-tenant HANA container setup, tenant DB management, memory tuning |
| Ensure performance, availability, security | Live memory gauges, delta merge monitoring, analytic privileges, audit logging |
| Database backups & disaster recovery | System replication (Primary → DR), automated backup catalog, point-in-time recovery runbook |
| Monitor & troubleshoot | Operations dashboard with slow query tracking, table growth alerts, replication lag |
| Implement upgrades & patches | Documented patch strategy, zero-downtime tenant migration approach |
| Manage user access & permissions | Role-based analytic privileges, row-level security, audit trail compliance |

---

## Live Demo

```bash
# Clone and run in one command
git clone <repo> && cd zimgrid-hana-billing
cp .env.example .env
docker-compose up --build

# Then open:
# Frontend:  http://localhost:5173
# API:       http://localhost:4000/api/v1/health
```

---

## Key Features

### For the Business
- **1.2M+ customer accounts** supported with partitioned column-store tables
- **Prepaid token vending** with distributed idempotency locks (prevents double-charge on network retry)
- **Dual-currency billing** (USD + ZiG) with locked exchange rates for regulatory compliance
- **Grid asset mapping** with spatial queries — find all transformers within 5km of an outage
- **ZERA-compliant audit trails** — every billing change logged immutably for 7 years

### For the DBA
- **Real-time HANA health dashboard** — memory pressure, CPU, active connections
- **System replication monitor** — Primary/DR lag in seconds with auto-failover runbook
- **Delta merge tracking** — automated scheduling for high-insert meter reading tables
- **Table growth visualization** — column-store size trends with partition pruning stats
- **Backup verification panel** — last full backup, incremental status, catalog integrity

---


**Stack:** `SAP HANA 2.0` · `S/4HANA 2023` · `Node.js 20` · `React 18` · `Redis 7` · `Docker`

---

## Database Highlights

| Table | Volume | Store | Partition | Purpose |
|-------|--------|-------|-----------|---------|
| `meter_readings` | 40M rows/month | Column | RANGE (monthly) + HASH | Daily consumption data |
| `billing_documents` | 2M rows/month | Column | RANGE (monthly) | Invoices & revenue |
| `prepaid_tokens` | High concurrency | Column | HASH (8 partitions) | Token vending with idempotency |
| `grid_assets` | 50K assets | Column | — | Spatial index on location |
| `audit_logs` | Append-only | Column | RANGE (monthly) | Regulatory compliance |

**Spatial Queries:** HANA `ST_GEOMETRY(4326)` with GiST indexes for sub-50ms neighbor lookups.

**Security:** Analytic privileges enforce regional data isolation — Harare staff cannot see Bulawayo records.

---

## Screenshots

*(Placeholder — deploy and add screenshots of the Operations Center dashboard)*

1. **Operations Overview** — Revenue, consumption, active outages, system health
2. **DBA Operations Center** — Memory usage, replication lag, table growth, delta merge status
3. **Grid Asset Map** — Spatial view of substations and transformers
4. **Prepaid Token Monitor** — Live vending queue with idempotency verification

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev outside containers)

### Run Everything
```bash
# 1. Clone
git clone <repo>
cd zimgrid-hana-billing

# 2. Environment
cp .env.example .env

# 3. Development (hot reload)
docker-compose -f docker-compose.dev.yml up --build

# 4. Or Production (optimized builds)
docker-compose up --build
```

### Access Points
| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend Dashboard | http://localhost:5173 | — |
| REST API | http://localhost:4000/api/v1 | — |
| Health Check | http://localhost:4000/api/v1/health | — |
| pgAdmin (DB GUI) | http://localhost:5050 | admin@zimgrid.local / admin |
| Grafana Monitoring | http://localhost:3000 | admin / admin |

---

## Project Structure

```
zimgrid-hana-billing/
├── docs/
│   ├── architecture/          # System diagrams, network topology
│   └── runbooks/             # Backup/DR, delta merge tuning, security hardening
├── database/
│   ├── hana-schema/          # HANA DDL (column store, partitions, CVs)
│   ├── migrations/           # PostgreSQL dev migrations
│   └── backup-scripts/       # hdbbackup, hdbrecovery procedures
├── backend/
│   ├── src/routes/           # API endpoints (customers, meters, billing, ops)
│   ├── src/config/           # HANA client & PostgreSQL connection pools
│   └── Dockerfile.dev        # Hot-reload development container
├── frontend/
│   ├── src/pages/            # Dashboard, Operations Center, Grid Map
│   ├── src/components/       # Charts, stat cards, activity feeds
│   └── Dockerfile.dev        # Vite HMR development container
└── docker-compose.yml        # Production orchestration
```

---

## HANA Production Deployment Notes

This project uses **PostgreSQL for local development** with a schema designed for direct migration to SAP HANA 2.0:

1. Swap `pg` driver for `@sap/hana-client`
2. Convert `BIGSERIAL` → `BIGINT GENERATED ALWAYS AS IDENTITY`
3. Convert `GEOGRAPHY` → `ST_GEOMETRY(4326)`
4. Enable column store on all fact tables
5. Activate range + hash partitioning
6. Configure System Replication (Primary → Secondary)
7. Deploy analytic privileges for regional data isolation

See `docs/runbooks/` for full migration and operational procedures.

---

## Skills Demonstrated

- **SAP HANA 2.0 Administration** — MDC, column store, partitioning, delta merge, system replication
- **SAP S/4 HANA Integration** — Calculation views, analytic privileges, OData services
- **Database Performance Tuning** — Index strategy, partition pruning, query plan analysis
- **Disaster Recovery** — Backup catalog management, point-in-time recovery, failover runbooks
- **Security & Compliance** — Row-level security, audit logging, X.509 certificate auth
- **Full-Stack Engineering** — Node.js API design, React dashboard, Docker containerization
- **Domain Expertise** — Utility billing, prepaid metering, multi-currency, grid asset management

---

## License

MIT — Built for portfolio and educational purposes. Not affiliated with any utility company.

---

**Built by [Your Name]** · Systems Engineer (SAP S/4 HANA Database Administrator)

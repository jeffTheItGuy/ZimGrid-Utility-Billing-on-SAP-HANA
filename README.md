# ZimGrid — Utility Billing & Grid Operations on SAP HANA

> **A production-grade database operations platform for power utilities, engineered on SAP HANA 2.0 with real-time monitoring, disaster recovery architecture, and multi-currency billing.**
> 
> **Built as a portfolio project to demonstrate SAP S/4 HANA Database Administration expertise for the ZESA Holdings Systems Engineer (SAP S/4 HANA DBA) role.**

---

## What This Is

A full-stack utility billing system built for the unique challenges of **African power distribution** — unstable networks, dual-currency economies (USD/local), prepaid meter token vending, and grid asset tracking across vast geographic regions.

The backend runs on **SAP HANA 2.0** (column-store, in-memory) with a **React operations dashboard** that gives database administrators real-time visibility into system health, replication status, and high-volume transaction tables.

For local development and portfolio review, the project uses **PostgreSQL with a HANA-compatible schema** — all table structures, partitioning annotations, spatial indexes, and DBA runbooks are designed for **direct migration to SAP HANA 2.0**.

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

## Architecture

### Three-Tier Landscape

```
┌─────────────────────────────────────────────────────────────┐
│                        Fiori Gateway                        │
│                   (SAP Fiori Launchpad)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   S/4HANA App Server (ABAP)                  │
│              OData Services / BAPI / RFC                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SAP HANA 2.0 — Multi-Tenant DB                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  System DB   │  │  Tenant DB   │  │  XS Engine   │     │
│  │  (MANAGES)   │  │   (HDB)      │  │  (SERVICES)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │   Primary    │◄──►│  Secondary   │
         │   (Harare)   │ SR │  (Bulawayo)  │
         └──────────────┘    └──────────────┘
```

### Dual-Database Landscape

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Development (Docker)  │         │   Production (ZESA DC)  │
│                         │         │                         │
│  PostgreSQL 16 + PostGIS│         │  SAP HANA 2.0 MDC       │
│  ├─ zimgrid_billing     │  ───►  │  ├─ SYSTEMDB            │
│  ├─ Column-store schema │         │  ├─ Tenant DB (HDB)    │
│  └─ GiST spatial indexes│         │  ├─ Column tables       │
│                         │         │  ├─ Range+Hash parts    │
│  Redis (idempotency)    │         │  └─ System Replication  │
│  Node.js API            │         │                         │
│  React Dashboard        │         │  Primary: Harare        │
│                         │         │  Secondary: Bulawayo DR │
└─────────────────────────┘         └─────────────────────────┘
         │
         │  USE_HANA=true
         ▼
  @sap/hana-client connects
  to HANA tenant via SQL port
```

### HANA Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `global_allocation_limit` | 85% of RAM | Prevents OS swap |
| `savepoint_interval_s` | 300 | 5-minute persistence |
| `log_mode` | NORMAL | Point-in-time recovery |
| `auto_log_backup` | TRUE | 15-minute log backups |
| `system_replication` | ASYNC | DR with 15-min RPO |

---

## Key Features

### For the Business
- **1.2M+ customer accounts** supported with partitioned column-store tables
- **Prepaid token vending** with distributed idempotency locks (prevents double-charge on network retry)
- **Dual-currency billing** (USD + ZiG) with locked exchange rates for regulatory compliance
- **Grid asset mapping** with spatial queries — find all transformers within 5km of an outage
- **ZERA-compliant audit trails** — every billing change logged immutably for 7 years

### For the DBA
- **Real-time HANA health dashboard** — memory pressure (`M_HOST_INFORMATION`), CPU, active connections
- **System replication monitor** — Primary/DR lag in seconds with auto-failover runbook
- **Delta merge tracking** — automated scheduling for high-insert meter reading tables (`M_TABLES`)
- **Table growth visualization** — column-store size trends with partition pruning stats
- **Backup verification panel** — last full backup, incremental status, catalog integrity (`M_BACKUP_CATALOG`)
- **Long-running statement alerts** — performance troubleshooting via `M_ACTIVE_STATEMENTS`

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

| Service | URL | Notes |
|---------|-----|-------|
| Frontend Dashboard | http://localhost:5173 | React + Vite |
| REST API | http://localhost:4000/api/v1 | Express + TypeScript |
| Health Check | http://localhost:4000/api/v1/health | Shows landscape mode (PostgreSQL dev / HANA prod) |
| HANA Admin API | http://localhost:4000/api/v1/hana-admin | Memory, replication, delta merge, backup catalog |

---

## HANA Administration

### DBA Scripts (`scripts/hana-dba/`)

These are production-grade `hdbsql` scripts a real SAP HANA DBA runs daily:

| Script | System View | DBA Task |
|---|---|---|
| `01_memory_overview.sql` | `M_HOST_INFORMATION` | Memory pressure monitoring |
| `02_replication_status.sql` | `M_SYSTEM_REPLICATION` | DR health / lag detection |
| `03_delta_merge_monitor.sql` | `M_TABLES` | Column-store merge tuning |
| `04_backup_catalog.sql` | `M_BACKUP_CATALOG` | Backup verification |
| `05_long_running_statements.sql` | `M_ACTIVE_STATEMENTS` | Performance troubleshooting |
| `06_tenant_admin.sql` | `M_DATABASES` | MDC tenant management |
| `07_analytic_privileges_setup.sql` | — | Regional row-level security |

Run any script via `hdbsql`:
```bash
hdbsql -u SYSTEM -p $HANA_PASS -d SYSTEMDB -I scripts/hana-dba/01_memory_overview.sql
```

### HANA Admin API Endpoints

When `USE_HANA=true`, these query live HANA system views. In dev mode, they return realistic mock data so the dashboard renders correctly.

| Endpoint | HANA View | Purpose |
|---|---|---|
| `GET /api/v1/hana-admin/memory` | `M_HOST_INFORMATION` | Physical memory usage gauge |
| `GET /api/v1/hana-admin/replication` | `M_SYSTEM_REPLICATION` | Primary/DR lag & status |
| `GET /api/v1/hana-admin/delta-merge` | `M_TABLES` | Delta vs main store per table |
| `GET /api/v1/hana-admin/backup-catalog` | `M_BACKUP_CATALOG` | Last 10 backup entries |
| `GET /api/v1/hana-admin/active-statements` | `M_ACTIVE_STATEMENTS` | Slow query detection |

---

## PostgreSQL → SAP HANA Migration

This project uses **PostgreSQL for local development** with a schema designed for direct migration to SAP HANA 2.0:

1. Swap `pg` driver for `@sap/hana-client` (already in `package.json`)
2. Convert `BIGSERIAL` → `BIGINT GENERATED ALWAYS AS IDENTITY`
3. Convert `GEOGRAPHY` → `ST_GEOMETRY(4326)`
4. Convert `JSONB` → `NCLOB` or JSON document store
5. Enable column store on all fact tables (`ALTER TABLE ... COLUMN LOADABLE`)
6. Activate range + hash partitioning
7. Configure System Replication (Primary → Secondary)
8. Deploy analytic privileges for regional data isolation

See `docs/runbooks/POSTGRES_TO_HANA_MIGRATION.md` for the full migration checklist.

---

## Runbooks

| Document | Purpose |
|---|---|
| `docs/runbooks/BACKUP_AND_RECOVERY.md` | Full backup (`BACKUP DATA`), log verification, point-in-time recovery |
| `docs/runbooks/DELTA_MERGE_TUNING.md` | High-volume table merge scheduling (`M_DELTA_MERGE_STATISTICS`) |
| `docs/runbooks/SECURITY_HARDENING.md` | X.509 auth, analytic privileges, audit policies |
| `docs/runbooks/POSTGRES_TO_HANA_MIGRATION.md` | Zero-downtime schema migration checklist |

---

## Screenshots

*(Deploy and add screenshots of the Operations Center dashboard)*

1. **Operations Overview** — Revenue, consumption, active outages, system health
2. **DBA Operations Center** — Memory usage, replication lag, table growth, delta merge status
3. **Grid Asset Map** — Spatial view of substations and transformers
4. **Prepaid Token Monitor** — Live vending queue with idempotency verification

---

## Skills Demonstrated

- **SAP HANA 2.0 Administration** — MDC, column store, partitioning, delta merge, system replication
- **SAP S/4 HANA Integration** — Calculation views, analytic privileges, OData services
- **Database Performance Tuning** — Index strategy, partition pruning, query plan analysis
- **Disaster Recovery** — Backup catalog management, point-in-time recovery, failover runbooks
- **Security & Compliance** — Row-level security, audit logging, X.509 certificate auth
- **Landscape Architecture** — Dual-mode database layer (PostgreSQL dev ↔ HANA prod) with zero-downtime migration path
- **Full-Stack Engineering** — Node.js API design, React dashboard, Docker containerization
- **Domain Expertise** — Utility billing, prepaid metering, multi-currency, grid asset management

---

## License

MIT — Built for portfolio and educational purposes. Not affiliated with any utility company.

---

**Built for the ZESA Holdings Systems Engineer (SAP S/4 HANA Database Administrator) position**


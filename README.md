# ZimGrid — Utility Billing & Grid Operations on SAP HANA

> **A production-grade database operations platform for power utilities, engineered on SAP HANA 2.0 with real-time monitoring, disaster recovery architecture, multi-currency billing, and a transparent dual-engine database layer.**
> 
> **Built as a portfolio project to demonstrate SAP S/4 HANA Database Administration expertise for the ZESA Holdings Systems Engineer (SAP S/4 HANA DBA) role.**

---

## What This Is

A full-stack utility billing system built for the unique challenges of **African power distribution** — unstable networks, dual-currency economies (USD/local), prepaid meter token vending, and grid asset tracking across vast geographic regions.

The backend runs on **SAP HANA 2.0** (column-store, in-memory) with a **React operations dashboard** that gives database administrators real-time visibility into system health, replication status, and high-volume transaction tables.

For local development and portfolio review, the project uses **PostgreSQL with a HANA-compatible schema** — all table structures, partitioning annotations, spatial indexes, and DBA runbooks are designed for **direct migration to SAP HANA 2.0**.

The critical architectural addition is a **Database Adapter Layer** with an **SQL Dialect Translator**. The same API codebase — customers, meters, billing, payments, prepaid tokens — runs transparently against either PostgreSQL (dev) or SAP HANA (production) without changing a single line of route logic. Flip `USE_HANA=true` and the application switches engines at runtime.

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
| **Cross-engine portability** | **Database adapter pattern + SQL translator enabling seamless PostgreSQL ↔ HANA migration** |

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

### Dual-Database Landscape with Adapter Layer

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
  ┌──────────────────────────────────────────┐
  │        Database Adapter Layer            │
  │  ┌────────────────────────────────────┐  │
  │  │   PostgresAdapter  (pg Pool)       │  │
  │  │   HanaAdapter      (@sap/hana)     │  │
  │  └────────────────────────────────────┘  │
  │  ┌────────────────────────────────────┐  │
  │  │   SQL Dialect Translator           │  │
  │  │   $1 → ?  |  ILIKE → UPPER()      │  │
  │  │   NOW() → CURRENT_TIMESTAMP        │  │
  │  │   INTERVAL → ADD_MONTHS/ADD_DAYS   │  │
  │  │   DATE_TRUNC → TRUNC               │  │
  │  │   TIMESTAMPTZ → TIMESTAMP          │  │
  │  │   PostGIS → ST_GEOMETRY            │  │
  │  └────────────────────────────────────┘  │
  └──────────────────────────────────────────┘
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
- **Transparent engine switching** — same API codebase runs on PostgreSQL (dev) or HANA (prod) via adapter pattern

---

## Database Adapter Layer

The adapter layer is the core architectural feature that makes this project production-grade. It solves the problem of maintaining two separate codebases (or fragile `if/else` blocks) when supporting two different SQL dialects.

### How It Works

1. **Environment Variable** — `USE_HANA` determines which adapter is instantiated at startup.
2. **Unified Interface** — All routes call `db.query()` and `db.getSystemHealth()` without knowing which engine is underneath.
3. **SQL Translation** — When `USE_HANA=true`, the `HanaAdapter` passes every SQL statement through a translator before executing it via `@sap/hana-client`.

### Translation Rules

| PostgreSQL | SAP HANA | Use Case |
|---|---|---|
| `$1, $2` | `?` | Positional parameters |
| `ILIKE` | `UPPER() LIKE UPPER()` | Case-insensitive search |
| `NOW()` | `CURRENT_TIMESTAMP` | Current timestamp |
| `INTERVAL '12 months'` | `ADD_MONTHS(CURRENT_DATE, -12)` | Date arithmetic |
| `DATE_TRUNC('month', col)` | `TRUNC(col, 'MONTH')` | Monthly aggregation |
| `TIMESTAMPTZ` | `TIMESTAMP` | Timestamp type |
| `ON CONFLICT DO NOTHING` | *(stripped)* | Upsert handling |
| `ST_SetSRID(ST_MakePoint(...), 4326)` | `NEW ST_POINT(...).ST_SRID(4326)` | Spatial data |
| `pg_database_size()` | `M_HOST_INFORMATION` / `M_MEMORY` | Database size |
| `pg_stat_activity` | `M_CONNECTIONS` | Active sessions |
| `pg_stat_user_tables` | `M_TABLES` | Table growth |

### INSERT Pattern (Portable)

HANA does not support PostgreSQL's `RETURNING` clause in the same way. The adapter uses a **natural-key insert + select** pattern:

```typescript
// 1. Generate deterministic document number
const docNum = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// 2. Insert without RETURNING
await db.query(
  `INSERT INTO incoming_payments (payment_document_number, ...) VALUES (?, ...)`,
  [docNum, ...]
);

// 3. Select back by natural key
const result = await db.query(
  `SELECT payment_id FROM incoming_payments WHERE payment_document_number = ?`,
  [docNum]
);
```

This pattern works identically on both PostgreSQL and HANA.

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

### Switch to SAP HANA Mode

Edit `.env`:

```env
USE_HANA=true
HANA_HOST=10.0.1.10
HANA_PORT=30015
HANA_USER=SYSTEM
HANA_PASSWORD=yourpassword
HANA_TENANT_DB=HDB
```

Restart the backend. The same API now queries the HANA tenant DB for business transactions and HANA system views for DBA monitoring. The frontend automatically detects the landscape mode and updates the sidebar badge from **"PostgreSQL — Dev Mode"** to **"HANA Primary — Harare"**.

### Access Points

| Service | URL | Notes |
|---------|-----|-------|
| Frontend Dashboard | http://localhost:5173 | React + Vite |
| REST API | http://localhost:4000/api/v1 | Express + TypeScript |
| Health Check | http://localhost:4000/api/v1/health | Returns landscape mode (`SAP_HANA_PROD` or `POSTGRESQL_DEV`) |
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

This project uses **PostgreSQL for local development** with a schema designed for direct migration to SAP HANA 2.0. The adapter layer eliminates the need for a separate HANA codebase:

1. Set `USE_HANA=true` in environment configuration
2. The `HanaAdapter` takes over — all business routes now execute against the HANA tenant DB
3. The `SQL Translator` automatically converts dialect differences at runtime
4. Install `@sap/hana-client` driver (already in `package.json`)
5. Configure System Replication (Primary → Secondary)
6. Deploy analytic privileges for regional data isolation

**No route code changes required.** The migration is purely infrastructure and configuration.

### Manual Schema Notes (for reference)

| PostgreSQL | SAP HANA | Notes |
|---|---|---|
| `BIGSERIAL PRIMARY KEY` | `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Auto-increment |
| `GEOGRAPHY(POINT,4326)` | `ST_GEOMETRY(4326)` | Spatial data |
| `JSONB` | `NCLOB` or JSON document store | Semi-structured data |
| `COLUMN STORE` (comments) | `ALTER TABLE ... COLUMN LOADABLE` | Fact tables |
| `RANGE + HASH` (comments) | `CREATE PARTITION ON ...` | Partitioning |

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
- **Database Adapter Pattern** — Runtime engine abstraction with unified `DatabaseAdapter` interface
- **SQL Dialect Engineering** — Cross-engine translator handling parameters, date arithmetic, spatial types, and upsert patterns
- **Full-Stack Engineering** — Node.js API design, React dashboard, Docker containerization
- **Domain Expertise** — Utility billing, prepaid metering, multi-currency, grid asset management

---

## License

MIT — Built for portfolio and educational purposes. Not affiliated with any utility company.

---

**Built for the ZESA Holdings Systems Engineer (SAP S/4 HANA Database Administrator) position**

# PostgreSQL -> SAP HANA 2.0 Migration Runbook

## Pre-Migration Checklist

- [ ] Provision HANA MDC (Multi-Database Container) instance
- [ ] Create tenant database `HDB` via SYSTEMDB
- [ ] Configure `global_allocation_limit` (85% of RAM)
- [ ] Enable System Replication to secondary site (Bulawayo DR)
- [ ] Install `@sap/hana-client` driver in application layer
- [ ] Set `USE_HANA=true` in environment configuration

## Schema Migration

### 1. Identity Columns
```sql
-- PostgreSQL
BIGSERIAL PRIMARY KEY

-- SAP HANA
BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

### 2. Spatial Data
```sql
-- PostgreSQL
location_point GEOGRAPHY(POINT,4326)

-- SAP HANA
location_point ST_GEOMETRY(4326)
-- Create spatial index: CREATE SPATIAL INDEX idx_loc ON table(location_point)
```

### 3. JSON Storage
```sql
-- PostgreSQL
old_values JSONB

-- SAP HANA
old_values NCLOB -- or JSON document store
```

### 4. Full-Text & Indexes
```sql
-- PostgreSQL
CREATE INDEX idx_bp_name ON business_partners USING GIN(to_tsvector(...));

-- SAP HANA
-- Fuzzy search enabled on column; inverted index auto-managed by column store
```

### 5. Table Store Types
```sql
-- Fact tables (high volume)
ALTER TABLE meter_readings COLUMN LOADABLE;
ALTER TABLE billing_documents COLUMN LOADABLE;
ALTER TABLE prepaid_tokens COLUMN LOADABLE;

-- Dimension / metadata tables
ALTER TABLE rate_categories ROW LOADABLE;
ALTER TABLE tariff_steps ROW LOADABLE;
```

### 6. Partitioning
```sql
-- meter_readings: RANGE (monthly) + HASH
CREATE PARTITION ON meter_readings (
  RANGE (reading_date) EVERY INTERVAL '1' MONTH,
  HASH (contract_account_id) PARTITIONS 8
);

-- billing_documents: RANGE (monthly)
CREATE PARTITION ON billing_documents (
  RANGE (bill_date) EVERY INTERVAL '1' MONTH
);
```

### 7. Analytic Privileges (Regional Isolation)
```sql
CREATE ANALYTIC PRIVILEGE AP_HARARE_REGION
FOR SELECT ON "billing_documents"
WHERE "region_code" = 'HR';

CREATE ANALYTIC PRIVILEGE AP_BULAWAYO_REGION
FOR SELECT ON "billing_documents"
WHERE "region_code" = 'BY';
```

## Post-Migration Validation

| Check | Query |
|-------|-------|
| Tenant DB status | `SELECT DATABASE_NAME, ACTIVE_STATUS FROM M_DATABASES` |
| Column store loaded | `SELECT TABLE_NAME, LOADED FROM M_TABLES WHERE SCHEMA_NAME = 'ZESA_BILLING'` |
| Partition pruning | `SELECT * FROM M_PARTITIONS WHERE TABLE_NAME = 'METER_READINGS'` |
| Memory usage | `SELECT * FROM M_MEMORY` |
| Replication lag | `SELECT SECONDARY_SITE_NAME, REPLICATION_STATUS FROM M_SYSTEM_REPLICATION` |

## Rollback Plan

1. Switch `USE_HANA=false` in application config
2. Redirect read traffic to PostgreSQL read replica
3. Investigate and fix HANA-specific errors
4. Re-run migration during next maintenance window

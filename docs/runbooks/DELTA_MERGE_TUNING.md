# Delta Merge Tuning Guide

## High-Volume Tables

### meter_readings (40M rows/month)
- **Auto Merge Threshold**: 10M delta records
- **Scheduled Merge**: 02:00 daily via cron
- **Manual Trigger**: During batch billing runs

```sql
-- Check delta merge status
SELECT * FROM M_DELTA_MERGE_STATISTICS 
WHERE TABLE_NAME = 'meter_readings' 
ORDER BY START_TIME DESC LIMIT 10;

-- Force merge (emergency only)
MERGE DELTA OF "meter_readings";
```

### billing_documents (2M rows/month)
- **Auto Merge**: After batch generation
- **Scheduled**: 03:00 daily

## Monitoring Queries

```sql
-- Tables with largest delta stores
SELECT SCHEMA_NAME, TABLE_NAME, 
       MEMORY_SIZE_IN_DELTA, MEMORY_SIZE_IN_MAIN,
       ROUND(MEMORY_SIZE_IN_DELTA * 100.0 / (MEMORY_SIZE_IN_DELTA + MEMORY_SIZE_IN_MAIN), 2) AS delta_pct
FROM M_TABLES
WHERE TABLE_TYPE = 'COLUMN'
ORDER BY MEMORY_SIZE_IN_DELTA DESC;
```

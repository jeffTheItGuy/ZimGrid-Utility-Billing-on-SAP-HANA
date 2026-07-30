-- ============================================================
-- Delta Merge Monitor
-- Identifies tables with large delta stores requiring merge
-- Frequency: Daily at 02:00 (before backup window)
-- ============================================================

SELECT 
  SCHEMA_NAME,
  TABLE_NAME,
  ROUND(MEMORY_SIZE_IN_DELTA/1024/1024, 2) AS DELTA_MB,
  ROUND(MEMORY_SIZE_IN_MAIN/1024/1024, 2) AS MAIN_MB,
  ROUND(MEMORY_SIZE_IN_DELTA * 100.0 / NULLIF(MEMORY_SIZE_IN_DELTA + MEMORY_SIZE_IN_MAIN, 0), 2) AS DELTA_PCT,
  CASE 
    WHEN MEMORY_SIZE_IN_DELTA * 100.0 / NULLIF(MEMORY_SIZE_IN_DELTA + MEMORY_SIZE_IN_MAIN, 0) > 10 THEN 'CRITICAL'
    WHEN MEMORY_SIZE_IN_DELTA * 100.0 / NULLIF(MEMORY_SIZE_IN_DELTA + MEMORY_SIZE_IN_MAIN, 0) > 5 THEN 'WARNING'
    ELSE 'OK'
  END AS MERGE_PRIORITY
FROM M_TABLES
WHERE TABLE_TYPE = 'COLUMN'
ORDER BY MEMORY_SIZE_IN_DELTA DESC;

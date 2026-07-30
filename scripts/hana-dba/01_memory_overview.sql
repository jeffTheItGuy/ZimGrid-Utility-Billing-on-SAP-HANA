-- ============================================================
-- HANA Memory Overview
-- Run as: hdbsql -u SYSTEM -p $HANA_PASS -d SYSTEMDB
-- Frequency: Every 5 minutes in monitoring
-- ============================================================

SELECT 
  HOST,
  ROUND(USED_PHYSICAL_MEMORY/1024/1024/1024, 2) AS USED_GB,
  ROUND(TOTAL_PHYSICAL_MEMORY/1024/1024/1024, 2) AS TOTAL_GB,
  ROUND(USED_PHYSICAL_MEMORY * 100.0 / TOTAL_PHYSICAL_MEMORY, 2) AS PCT_USED,
  ROUND(PEAK_PHYSICAL_MEMORY/1024/1024/1024, 2) AS PEAK_GB
FROM M_HOST_INFORMATION
WHERE KEY IN ('used_physical_memory', 'total_physical_memory', 'peak_physical_memory')
ORDER BY HOST;

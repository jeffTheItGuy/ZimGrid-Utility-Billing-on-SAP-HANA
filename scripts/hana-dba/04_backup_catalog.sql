-- ============================================================
-- Backup Catalog Verification
-- Run daily after backup window (02:00)
-- Alert if last full backup > 25 hours or any state != successful
-- ============================================================

SELECT 
  ENTRY_TYPE_NAME,
  UTC_START_TIME,
  STATE_NAME,
  ROUND(BACKUP_SIZE/1024/1024/1024, 2) AS SIZE_GB,
  DESTINATION_PATH
FROM M_BACKUP_CATALOG
WHERE ENTRY_TYPE_NAME IN ('complete data backup', 'incremental data backup', 'log backup')
ORDER BY UTC_START_TIME DESC
LIMIT 10;

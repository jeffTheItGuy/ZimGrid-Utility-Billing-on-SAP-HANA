-- ============================================================
-- HANA System Replication Status
-- Run on: PRIMARY (Harare) or SECONDARY (Bulawayo)
-- Frequency: Every minute during DR drills
-- ============================================================

SELECT 
  SITE_NAME AS PRIMARY_SITE,
  SECONDARY_SITE_NAME AS DR_SITE,
  REPLICATION_MODE,
  REPLICATION_STATUS,
  ROUND(SECONDARY_LOG_POSITION - PRIMARY_LOG_POSITION, 2) AS ESTIMATED_LAG_SECONDS,
  LAST_LOG_POSITION_SHIPPED
FROM M_SYSTEM_REPLICATION;

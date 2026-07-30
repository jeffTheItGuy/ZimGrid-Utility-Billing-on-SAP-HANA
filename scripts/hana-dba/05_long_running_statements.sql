-- ============================================================
-- Long-Running Statements
-- Run during performance troubleshooting or alert on >60s
-- ============================================================

SELECT 
  STATEMENT_ID,
  LEFT(STATEMENT_STRING, 120) AS STATEMENT_PREVIEW,
  ROUND(DURATION_MICROSEC/1000000, 2) AS DURATION_SEC,
  USER_NAME,
  APPLICATION_NAME,
  CLIENT_IP
FROM M_ACTIVE_STATEMENTS
WHERE DURATION_MICROSEC > 10000000  -- > 10 seconds
ORDER BY DURATION_MICROSEC DESC
LIMIT 20;

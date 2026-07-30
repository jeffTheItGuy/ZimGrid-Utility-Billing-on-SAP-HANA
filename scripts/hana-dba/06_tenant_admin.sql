-- ============================================================
-- Tenant Database Administration
-- Run on: SYSTEMDB as SYSTEM
-- ============================================================

-- List all tenant databases
SELECT DATABASE_NAME, ACTIVE_STATUS, OS_USER, SQL_PORT FROM M_DATABASES;

-- Stop a tenant (maintenance window)
-- ALTER SYSTEM STOP DATABASE 'HDB';

-- Start a tenant
-- ALTER SYSTEM START DATABASE 'HDB';

-- Check tenant memory allocation
SELECT DATABASE_NAME, MEMORY_SIZE_IN_TOTAL FROM M_DATABASES;

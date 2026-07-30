-- ============================================================
-- Analytic Privileges Setup
-- Regional data isolation for ZESA operations
-- Run on: Tenant DB (HDB) as SYSTEM or _SYS_REPO
-- ============================================================

-- Create application technical user
CREATE USER ZESA_APP_USER PASSWORD <password> NO FORCE_FIRST_PASSWORD_CHANGE;

-- Create role
CREATE ROLE ZESA_BILLING_READ;

-- Grant base SELECT on schema
GRANT SELECT ON SCHEMA ZESA_BILLING TO ZESA_BILLING_READ;

-- Create analytic privilege for Harare region
CREATE ANALYTIC PRIVILEGE AP_HARARE_REGION
FOR SELECT ON ZESA_BILLING."billing_documents"
WHERE "region_code" = 'HR';

-- Create analytic privilege for Bulawayo region
CREATE ANALYTIC PRIVILEGE AP_BULAWAYO_REGION
FOR SELECT ON ZESA_BILLING."billing_documents"
WHERE "region_code" = 'BY';

-- Assign privileges to role
GRANT ANALYTIC PRIVILEGE AP_HARARE_REGION TO ZESA_BILLING_READ;
GRANT ANALYTIC PRIVILEGE AP_BULAWAYO_REGION TO ZESA_BILLING_READ;

-- Assign role to technical user
GRANT ZESA_BILLING_READ TO ZESA_APP_USER;

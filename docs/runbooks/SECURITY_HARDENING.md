# HANA Security Hardening

## Post-Installation Checklist

1. **Disable standard users**
   ```sql
   ALTER USER SAP* DEACTIVATE USER NOW;
   ALTER USER SYSTEM DISABLE PASSWORD LIFETIME;
   ```

2. **Configure X.509 authentication for technical users**
   ```sql
   CREATE USER TECH_USER WITH IDENTITY 'CN=tech-user, O=ZESA, C=ZW' FOR X509;
   ```

3. **Analytic Privileges for regional isolation**
   ```sql
   CREATE ANALYTIC PRIVILEGE AP_HARARE_REGION 
   FOR SELECT ON "billing_documents"
   WHERE "region_code" = 'HR';
   ```

4. **Audit policy activation**
   ```sql
   CREATE AUDIT POLICY ALL_DML 
   AUDITING SUCCESSFUL SELECT, INSERT, UPDATE, DELETE 
   ON "meter_readings", "billing_documents", "incoming_payments";
   ```

## Certificate Management

| Certificate | Expiry | Action |
|-------------|--------|--------|
| HANA Server SSL | 2027-01-15 | Auto-renew via PKI |
| XS Engine SSL | 2027-01-15 | Auto-renew via PKI |
| Client Auth (DBA) | 2026-12-01 | Manual renewal |

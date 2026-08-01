-- ============================================================
-- ZESA Utility Billing Schema
-- Compatible with: PostgreSQL 16 (dev) | SAP HANA 2.0 (prod)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ===== BUSINESS PARTNERS =====
CREATE TABLE business_partners (
    partner_id BIGSERIAL PRIMARY KEY,
    partner_number VARCHAR(10) UNIQUE NOT NULL,
    partner_type VARCHAR(4) DEFAULT 'Z001',
    first_name VARCHAR(40),
    last_name VARCHAR(40),
    organization_name VARCHAR(80),
    date_of_birth DATE,
    gender VARCHAR(1),
    national_id VARCHAR(20) UNIQUE,
    phone_primary VARCHAR(30),
    phone_secondary VARCHAR(30),
    email VARCHAR(241),
    tax_number VARCHAR(20),
    customer_class VARCHAR(10) DEFAULT 'DOMESTIC',
    credit_status VARCHAR(2) DEFAULT 'A',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bp_partner_number ON business_partners(partner_number);
CREATE INDEX idx_bp_national_id ON business_partners(national_id);

-- ===== ADDRESSES =====
CREATE TABLE business_partner_addresses (
    address_id BIGSERIAL PRIMARY KEY,
    partner_id BIGINT REFERENCES business_partners(partner_id),
    address_type VARCHAR(20) DEFAULT 'XXDEFAULT',
    street VARCHAR(60),
    suburb VARCHAR(40),
    city VARCHAR(40),
    province VARCHAR(40),
    postal_code VARCHAR(10),
    country VARCHAR(3) DEFAULT 'ZW',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location_point GEOGRAPHY(POINT,4326),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_address_location ON business_partner_addresses USING GIST(location_point);

-- ===== CONTRACT ACCOUNTS =====
CREATE TABLE contract_accounts (
    contract_account_id BIGSERIAL PRIMARY KEY,
    contract_account_number VARCHAR(12) UNIQUE NOT NULL,
    partner_id BIGINT REFERENCES business_partners(partner_id),
    company_code VARCHAR(4) DEFAULT 'ZESA',
    account_category VARCHAR(2) DEFAULT '01',
    account_status VARCHAR(2) DEFAULT 'ACTIVE',
    payment_method VARCHAR(10) DEFAULT 'PREPAID',
    currency VARCHAR(5) DEFAULT 'USD',
    alternate_currency VARCHAR(5) DEFAULT 'ZIG',
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    last_bill_date DATE,
    next_bill_date DATE,
    direct_debit_mandate BOOLEAN DEFAULT FALSE,
    bank_account VARCHAR(18),
    bank_name VARCHAR(60),
    created_by VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ca_partner ON contract_accounts(partner_id, account_status);

-- ===== EQUIPMENT MASTER =====
CREATE TABLE equipment_master (
    equipment_id BIGSERIAL PRIMARY KEY,
    equipment_number VARCHAR(18) UNIQUE NOT NULL,
    equipment_category VARCHAR(10) DEFAULT 'METER',
    equipment_type VARCHAR(10) DEFAULT 'PREPAID',
    manufacturer VARCHAR(30),
    model_number VARCHAR(30),
    serial_number VARCHAR(30) UNIQUE,
    installation_date DATE,
    decommission_date DATE,
    functional_location VARCHAR(30),
    grid_asset_id BIGINT,
    meter_type VARCHAR(20) DEFAULT 'PREPAID',
    max_current DECIMAL(10,2),
    voltage_rating DECIMAL(10,2),
    ct_ratio VARCHAR(10),
    meter_constant DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eq_serial ON equipment_master(serial_number);

-- ===== INSTALLATIONS =====
CREATE TABLE installations (
    installation_id BIGSERIAL PRIMARY KEY,
    installation_number VARCHAR(20) UNIQUE NOT NULL,
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    equipment_id BIGINT REFERENCES equipment_master(equipment_id),
    address_id BIGINT REFERENCES business_partner_addresses(address_id),
    rate_category VARCHAR(10) DEFAULT 'DOM01',
    voltage_level VARCHAR(10) DEFAULT 'LOW',
    connection_type VARCHAR(10) DEFAULT 'POSTPAID',
    connection_status VARCHAR(10) DEFAULT 'ACTIVE',
    connected_load_kw DECIMAL(10,2),
    contract_demand_kw DECIMAL(10,2),
    installation_date DATE,
    disconnection_date DATE,
    disconnection_reason VARCHAR(40),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inst_account ON installations(contract_account_id, connection_status);

-- ===== GRID ASSETS =====
CREATE TABLE grid_assets (
    asset_id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(18) UNIQUE NOT NULL,
    asset_category VARCHAR(20) DEFAULT 'TRANSFORMER',
    asset_type VARCHAR(20),
    description VARCHAR(40),
    manufacturer VARCHAR(30),
    year_manufactured INT,
    installation_date DATE,
    rated_capacity_kva DECIMAL(10,2),
    voltage_primary DECIMAL(10,2),
    voltage_secondary DECIMAL(10,2),
    location_point GEOGRAPHY(POINT,4326),
    region_code VARCHAR(4),
    district_code VARCHAR(4),
    feeder_code VARCHAR(10),
    substation_id BIGINT,
    parent_asset_id BIGINT,
    maintenance_status VARCHAR(10) DEFAULT 'OPERATIONAL',
    last_inspection_date DATE,
    next_inspection_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_asset_location ON grid_assets USING GIST(location_point);
CREATE INDEX idx_asset_region ON grid_assets(region_code, district_code);

-- ===== SUBSTATIONS =====
CREATE TABLE substations (
    substation_id BIGSERIAL PRIMARY KEY,
    substation_code VARCHAR(10) UNIQUE NOT NULL,
    substation_name VARCHAR(40),
    region_code VARCHAR(4),
    district_code VARCHAR(4),
    voltage_level VARCHAR(10),
    transformer_count INT DEFAULT 0,
    customer_count INT DEFAULT 0,
    location_point GEOGRAPHY(POINT,4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sub_location ON substations USING GIST(location_point);

-- ===== METER READINGS =====
CREATE TABLE meter_readings (
    reading_id BIGSERIAL PRIMARY KEY,
    reading_number VARCHAR(20) UNIQUE NOT NULL,
    equipment_id BIGINT REFERENCES equipment_master(equipment_id),
    installation_id BIGINT REFERENCES installations(installation_id),
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    reading_date DATE NOT NULL,
    reading_time TIME,
    reading_type VARCHAR(4) DEFAULT '01',
    reading_source VARCHAR(20) DEFAULT 'MANUAL',
    register_reading DECIMAL(18,6),
    previous_reading DECIMAL(18,6),
    consumption_kwh DECIMAL(18,6),
    consumption_kvarh DECIMAL(18,6),
    demand_kw DECIMAL(18,6),
    meter_reader_id VARCHAR(10),
    reading_status VARCHAR(2) DEFAULT '00',
    billable_flag BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reading_equipment_date ON meter_readings(equipment_id, reading_date DESC);
CREATE INDEX idx_reading_account_date ON meter_readings(contract_account_id, reading_date DESC);
CREATE INDEX idx_reading_billable ON meter_readings(reading_date) WHERE billable_flag = TRUE;

-- ===== RATE CATEGORIES =====
CREATE TABLE rate_categories (
    rate_category_id SERIAL PRIMARY KEY,
    rate_category_code VARCHAR(10) UNIQUE NOT NULL,
    description VARCHAR(40),
    voltage_level VARCHAR(10),
    customer_type VARCHAR(20) DEFAULT 'DOMESTIC',
    currency_code VARCHAR(5) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TARIFF STEPS =====
CREATE TABLE tariff_steps (
    tariff_step_id BIGSERIAL PRIMARY KEY,
    rate_category_id INT REFERENCES rate_categories(rate_category_id),
    step_number INT NOT NULL,
    step_from_kwh DECIMAL(18,6),
    step_to_kwh DECIMAL(18,6),
    energy_rate DECIMAL(18,8),
    fixed_charge DECIMAL(15,2),
    demand_charge DECIMAL(15,2),
    reactive_charge DECIMAL(15,2),
    vat_rate DECIMAL(5,4) DEFAULT 0.1500,
    rural_electrification_levy DECIMAL(5,4) DEFAULT 0.0300,
    currency_code VARCHAR(5) DEFAULT 'USD',
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rate_category_id, step_number, effective_from)
);

-- ===== BILLING DOCUMENTS =====
CREATE TABLE billing_documents (
    bill_id BIGSERIAL PRIMARY KEY,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    installation_id BIGINT REFERENCES installations(installation_id),
    company_code VARCHAR(4) DEFAULT 'ZESA',
    bill_type VARCHAR(4) DEFAULT '001',
    bill_period_from DATE,
    bill_period_to DATE,
    bill_date DATE,
    due_date DATE,
    currency_code VARCHAR(5) DEFAULT 'USD',
    exchange_rate DECIMAL(24,10) DEFAULT 1.0000000000,
    alternate_currency_code VARCHAR(5) DEFAULT 'ZIG',
    alternate_total DECIMAL(15,2),
    total_consumption_kwh DECIMAL(18,6),
    energy_charge DECIMAL(15,2),
    fixed_charge DECIMAL(15,2),
    demand_charge DECIMAL(15,2),
    vat_amount DECIMAL(15,2),
    rural_levy DECIMAL(15,2),
    subtotal DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2),
    payment_status VARCHAR(2) DEFAULT '00',
    print_status VARCHAR(2) DEFAULT '00',
    reversal_status VARCHAR(2) DEFAULT '00',
    created_by VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bill_number ON billing_documents(bill_number);
CREATE INDEX idx_bill_account_date ON billing_documents(contract_account_id, bill_date DESC);
CREATE INDEX idx_bill_status ON billing_documents(payment_status, due_date);

-- ===== BILLING LINE ITEMS =====
CREATE TABLE billing_line_items (
    line_item_id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT REFERENCES billing_documents(bill_id),
    line_item_type VARCHAR(4) DEFAULT '001',
    description VARCHAR(40),
    quantity DECIMAL(18,6),
    unit_of_measure VARCHAR(3),
    unit_price DECIMAL(18,8),
    line_amount DECIMAL(15,2),
    vat_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    currency_code VARCHAR(5) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== PREPAID TOKENS =====
CREATE TABLE prepaid_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    token_number VARCHAR(40) UNIQUE NOT NULL,
    meter_serial VARCHAR(30) REFERENCES equipment_master(serial_number),
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    purchase_amount DECIMAL(15,2),
    currency_code VARCHAR(5) DEFAULT 'USD',
    kwh_credited DECIMAL(18,6),
    tariff_rate_applied DECIMAL(18,8),
    vat_amount DECIMAL(15,2),
    rural_levy DECIMAL(15,2),
    token_value VARCHAR(40),
    vend_request_id VARCHAR(30) UNIQUE,
    idempotency_key VARCHAR(64) UNIQUE,
    payment_reference VARCHAR(50),
    payment_method VARCHAR(20) DEFAULT 'CASH',
    status VARCHAR(20) DEFAULT 'PENDING',
    issued_at TIMESTAMPTZ,
    redeemed_at TIMESTAMPTZ,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_meter ON prepaid_tokens(meter_serial, issued_at DESC);
CREATE INDEX idx_token_idempotency ON prepaid_tokens(idempotency_key);
CREATE INDEX idx_token_payment ON prepaid_tokens(payment_reference);

-- ===== INCOMING PAYMENTS =====
CREATE TABLE incoming_payments (
    payment_id BIGSERIAL PRIMARY KEY,
    payment_document_number VARCHAR(30) UNIQUE NOT NULL,
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    bill_id BIGINT REFERENCES billing_documents(bill_id),
    company_code VARCHAR(4) DEFAULT 'ZESA',
    payment_date DATE,
    posting_date DATE,
    currency_code VARCHAR(5) DEFAULT 'USD',
    amount DECIMAL(15,2),
    exchange_rate DECIMAL(24,10) DEFAULT 1.0000000000,
    base_currency_amount DECIMAL(15,2),
    payment_method VARCHAR(20) DEFAULT 'CASH',
    payment_reference VARCHAR(50),
    bank_code VARCHAR(10),
    branch_code VARCHAR(10),
    bank_account VARCHAR(18),
    clearing_document VARCHAR(20),
    reconciliation_status VARCHAR(2) DEFAULT '00',
    reversal_status VARCHAR(2) DEFAULT '00',
    created_by VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_doc ON incoming_payments(payment_document_number);
CREATE INDEX idx_payment_account ON incoming_payments(contract_account_id, payment_date DESC);
CREATE INDEX idx_payment_ref ON incoming_payments(payment_reference);

-- ===== SERVICE OUTAGES =====
CREATE TABLE service_outages (
    outage_id BIGSERIAL PRIMARY KEY,
    outage_number VARCHAR(20) UNIQUE NOT NULL,
    outage_type VARCHAR(20) DEFAULT 'UNPLANNED',
    cause_code VARCHAR(10),
    affected_asset_id BIGINT REFERENCES grid_assets(asset_id),
    affected_region VARCHAR(4),
    affected_district VARCHAR(4),
    affected_feeder VARCHAR(10),
    estimated_customers INT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_minutes INT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    restoration_notes VARCHAR(500),
    crew_assigned VARCHAR(20),
    created_by VARCHAR(12),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_outage_asset ON service_outages(affected_asset_id, start_time DESC);
CREATE INDEX idx_outage_region ON service_outages(affected_region, status);

-- ===== OUTAGE CUSTOMER IMPACTS =====
CREATE TABLE outage_customer_impacts (
    impact_id BIGSERIAL PRIMARY KEY,
    outage_id BIGINT REFERENCES service_outages(outage_id),
    contract_account_id BIGINT REFERENCES contract_accounts(contract_account_id),
    installation_id BIGINT REFERENCES installations(installation_id),
    estimated_compensation_kwh DECIMAL(18,6),
    compensation_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== AUDIT LOGS =====
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(256),
    operation VARCHAR(20),
    primary_key_value VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(12),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    transaction_id VARCHAR(28),
    application_name VARCHAR(256),
    client_ip VARCHAR(45)
);

CREATE INDEX idx_audit_table ON audit_logs(table_name, changed_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(changed_by, changed_at DESC);

-- ===== ANALYTIC PRIVILEGES =====
CREATE TABLE analytic_privileges (
    privilege_id BIGSERIAL PRIMARY KEY,
    privilege_name VARCHAR(256) UNIQUE NOT NULL,
    schema_name VARCHAR(256),
    view_name VARCHAR(256),
    filter_condition VARCHAR(5000),
    valid_for_user VARCHAR(256),
    valid_for_role VARCHAR(256),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
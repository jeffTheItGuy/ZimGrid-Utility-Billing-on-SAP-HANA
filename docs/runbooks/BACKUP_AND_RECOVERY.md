# Backup & Recovery Runbook

## Daily Operations

### Full Backup (02:00 daily)
```bash
hdbsql -u SYSTEM -p $HANA_PASS -d SYSTEMDB   "BACKUP DATA USING FILE ('/backup/full/HDB_$(date +%Y%m%d)')"
```

### Log Backup Verification
```bash
hdbsql -u SYSTEM -p $HANA_PASS -d HDB   "SELECT * FROM M_BACKUP_CATALOG WHERE ENTRY_TYPE_NAME = 'log backup' ORDER BY UTC_START_TIME DESC LIMIT 5"
```

## Disaster Recovery

### System Replication Takeover
```bash
# On secondary (Bulawayo)
hdbnsutil -sr_takeover

# Verify takeover
hdbnsutil -sr_state
```

### Point-in-Time Recovery
```bash
# Recover to specific timestamp
hdbrecovery -d HDB -u SYSTEM -p $HANA_PASS   --recoverDatabase --untilTimestamp "2026-07-30 14:30:00"
```

## Retention Policy

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Full Data | Daily | 30 days |
| Incremental | Daily | 14 days |
| Log | Every 15 min | 7 days |
| System Replication | Continuous | N/A |

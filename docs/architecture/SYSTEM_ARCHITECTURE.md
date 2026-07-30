# System Architecture

## Three-Tier Landscape

```
┌─────────────────────────────────────────────────────────────┐
│                        Fiori Gateway                        │
│                   (SAP Fiori Launchpad)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   S/4HANA App Server (ABAP)                  │
│              OData Services / BAPI / RFC                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SAP HANA 2.0 — Multi-Tenant DB                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  System DB   │  │  Tenant DB   │  │  XS Engine   │      │
│  │  (MANAGES)   │  │   (HDB)      │  │  (SERVICES)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────┐    ┌──────────────┐
         │   Primary    │◄──►│  Secondary   │
         │   (Harare)   │ SR │  (Bulawayo)  │
         └──────────────┘    └──────────────┘
```

## HANA Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `global_allocation_limit` | 85% of RAM | Prevents OS swap |
| `savepoint_interval_s` | 300 | 5-minute persistence |
| `log_mode` | NORMAL | Point-in-time recovery |
| `auto_log_backup` | TRUE | 15-minute log backups |
| `system_replication` | ASYNC | DR with 15-min RPO |

## Network Topology

- **Primary Site**: Harare Data Center (10.0.1.0/24)
- **DR Site**: Bulawayo Data Center (10.0.2.0/24)
- **Replication**: HANA System Replication over dedicated 1Gbps link
- **Backup**: NFS mount to offsite storage (daily full, 15-min incremental)

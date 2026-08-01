export interface QueryResult {
  rows: any[];
  rowCount: number;
}

export interface SystemHealthResult {
  database_size_bytes: number;
  active_connections: number;
  uptime_seconds: number;
  replication_lag_seconds: number;
  last_backup_time: string;
  delta_merge_status: string;
}

export interface TableGrowthRecord {
  schemaname: string;
  table_name: string;
  total_size: string;
  size_bytes: number;
}

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult>;
  getSystemHealth(): Promise<SystemHealthResult>;
  getTableGrowth(): Promise<TableGrowthRecord[]>;
  end(): Promise<void>;
}
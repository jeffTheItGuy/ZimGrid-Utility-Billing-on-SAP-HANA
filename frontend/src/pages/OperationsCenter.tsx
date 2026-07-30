import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Database, HardDrive, Activity, Timer, Server, Shield } from 'lucide-react'

export function OperationsCenter() {
  const { data: health } = useQuery('system-health', () =>
    api.get('/operations/system-health').then((r) => r.data)
  )

  const { data: tableGrowth } = useQuery('table-growth', () =>
    api.get('/operations/table-growth').then((r) => r.data)
  )

  const { data: memory } = useQuery('hana-memory', () =>
    api.get('/hana-admin/memory').then((r) => r.data).catch(() => null)
  )

  const { data: replication } = useQuery('hana-replication', () =>
    api.get('/hana-admin/replication').then((r) => r.data).catch(() => null)
  )

  const { data: deltaMerge } = useQuery('hana-delta-merge', () =>
    api.get('/hana-admin/delta-merge').then((r) => r.data).catch(() => null)
  )

  const { data: backups } = useQuery('hana-backups', () =>
    api.get('/hana-admin/backup-catalog').then((r) => r.data).catch(() => null)
  )

  const isMock = memory?.mode === 'MOCK'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">DBA Operations Center</h2>
        <p className="text-gray-500">SAP HANA database monitoring and administration</p>
        {isMock && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
            <Server className="w-3 h-3" />
            Running in PostgreSQL dev mode — HANA metrics simulated for UI preview
          </div>
        )}
      </div>

      {/* Landscape Badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          health?.landscape === 'SAP_HANA_PROD' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {health?.landscape || 'POSTGRESQL_DEV'}
        </span>
        <span className="text-xs text-gray-400">Tenant: {health?.services?.mode || 'N/A'}</span>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-sky-600" />
            <span className="text-sm text-gray-500">DB Size</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {health ? (health.database_size_bytes / 1024 / 1024 / 1024).toFixed(1) : '--'} GB
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Connections</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{health?.active_connections || '--'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Timer className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-gray-500">Replication Lag</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {replication?.replication?.lag_seconds ?? health?.replication_lag_seconds ?? 0}s
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-500">Delta Merge</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Healthy</p>
        </div>
      </div>

      {/* HANA Memory & Replication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            HANA Memory Overview
          </h3>
          {memory ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Used Physical Memory</span>
                  <span className="font-medium">{memory.memory?.used_gb ?? '--'} GB / {memory.memory?.total_gb ?? '--'} GB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-sky-600 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min(memory.memory?.pct_used || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{memory.memory?.pct_used ?? '--'}% utilized</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Peak Memory</p>
                  <p className="text-lg font-semibold text-gray-900">{memory.memory?.peak_gb ?? '--'} GB</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Host</p>
                  <p className="text-lg font-semibold text-gray-900">{memory.memory?.host ?? 'hana-primary'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading HANA memory metrics...</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            System Replication
          </h3>
          {replication ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Primary — {replication.replication?.primary_site ?? 'Harare DC'}</p>
                  <p className="text-xs text-green-700">Mode: {replication.replication?.replication_mode ?? 'ASYNC'}</p>
                </div>
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Secondary — {replication.replication?.secondary_site ?? 'Bulawayo DR'}</p>
                  <p className="text-xs text-blue-700">Lag: {replication.replication?.lag_seconds ?? 0}s</p>
                </div>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Replicating</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading replication status...</p>
          )}
        </div>
      </div>

      {/* Delta Merge Monitor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Delta Merge Monitor (M_TABLES)</h3>
          <span className="text-xs text-gray-400">Column Store</span>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schema</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delta (MB)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main (MB)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delta %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deltaMerge?.tables?.map((table: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4 font-mono text-sm text-gray-900">{table.schema}</td>
                <td className="px-6 py-4 font-mono text-sm text-gray-900">{table.table}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{table.delta_mb}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{table.main_mb}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    table.delta_pct > 10 ? 'bg-red-100 text-red-800' :
                    table.delta_pct > 5 ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {table.delta_pct}%
                  </span>
                </td>
              </tr>
            )) || (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No delta merge data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Backup Catalog */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Backup Catalog</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time (UTC)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {backups?.backups?.map((bk: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{bk.entry_type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(bk.utc_start).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    bk.state === 'successful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bk.state}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{bk.size_gb} GB</td>
              </tr>
            )) || (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                  No backup catalog entries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PostgreSQL Table Growth (existing) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Table Growth Monitor</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schema</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableGrowth?.map((table: any) => (
              <tr key={table.table_name}>
                <td className="px-6 py-4 font-mono text-sm text-gray-900">{table.table_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{table.schemaname}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{table.total_size}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">COLUMN</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">RANGE (monthly)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

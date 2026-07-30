import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Database, HardDrive, Activity, Timer } from 'lucide-react'

export function OperationsCenter() {
  const { data: health } = useQuery('system-health', () =>
    api.get('/operations/system-health').then((r) => r.data)
  )

  const { data: tableGrowth } = useQuery('table-growth', () =>
    api.get('/operations/table-growth').then((r) => r.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">DBA Operations Center</h2>
        <p className="text-gray-500">SAP HANA database monitoring and administration</p>
      </div>

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
          <p className="text-2xl font-bold text-gray-900">{health?.replication_lag_seconds || 0}s</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-500">Delta Merge</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Healthy</p>
        </div>
      </div>

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

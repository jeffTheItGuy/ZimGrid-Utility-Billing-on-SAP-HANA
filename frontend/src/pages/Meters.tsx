import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Search, Gauge, ChevronLeft, ChevronRight, Activity, Calendar, Hash, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function Meters() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedMeter, setSelectedMeter] = useState<any>(null)
  const [readingsTab, setReadingsTab] = useState<'readings' | 'trend'>('readings')

  const { data, isLoading } = useQuery(['meters', page, search], () =>
    api.get('/meters', { params: { page, limit: 20, search: search || undefined } }).then(r => r.data)
  )

  const { data: readings, isLoading: readingsLoading } = useQuery(
    ['meter-readings', selectedMeter?.equipment_id],
    () => api.get('/meters/readings', { 
      params: { 
        equipment_id: selectedMeter.equipment_id,
        from: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
        limit: 100
      } 
    }).then(r => r.data),
    { enabled: !!selectedMeter }
  )

  const { data: trend, isLoading: trendLoading } = useQuery(
    ['meter-trend', selectedMeter?.equipment_id],
    () => api.get(`/meters/${selectedMeter.equipment_id}/consumption-trend`).then(r => r.data),
    { enabled: !!selectedMeter }
  )

  const meters = data?.data || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meters & Readings</h2>
        <p className="text-gray-500 mt-1">Equipment master, installation data, and consumption history</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by serial or equipment number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-sm text-gray-500">{meters.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading meters...</td></tr>
              ) : meters.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No meters found</td></tr>
              ) : meters.map((m: any) => (
                <tr key={m.equipment_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{m.equipment_number}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{m.serial_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{m.equipment_type}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.manufacturer || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setSelectedMeter(m); setReadingsTab('readings') }}
                      className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                      View Readings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={meters.length < 20}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMeter && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-sky-600" />
              <h3 className="font-semibold text-gray-900">
                {selectedMeter.equipment_number} — {selectedMeter.serial_number}
              </h3>
            </div>
            <button onClick={() => setSelectedMeter(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setReadingsTab('readings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${readingsTab === 'readings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Recent Readings
            </button>
            <button 
              onClick={() => setReadingsTab('trend')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${readingsTab === 'trend' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Consumption Trend
            </button>
          </div>

          <div className="p-6">
            {readingsTab === 'readings' ? (
              readingsLoading ? (
                <p className="text-sm text-gray-400">Loading readings...</p>
              ) : !readings || readings.length === 0 ? (
                <p className="text-sm text-gray-400">No readings found for this meter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reading</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Consumption (kWh)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {readings.map((r: any) => (
                        <tr key={r.reading_id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{r.reading_date}</td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-900">
                            {r.register_reading != null ? parseFloat(r.register_reading).toFixed(2) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {r.consumption_kwh != null ? parseFloat(r.consumption_kwh).toFixed(2) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{r.reading_source}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${r.billable_flag ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {r.billable_flag ? 'Billable' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              trendLoading ? (
                <p className="text-sm text-gray-400">Loading trend data...</p>
              ) : !trend || trend.length === 0 ? (
                <p className="text-sm text-gray-400">No trend data available.</p>
              ) : (
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="total_kwh" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7', r: 4 }} name="kWh" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {trend.slice(-3).map((t: any) => (
                      <div key={t.month} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">{t.month}</p>
                        <p className="text-lg font-semibold text-gray-900">{parseFloat(t.total_kwh).toFixed(1)} kWh</p>
                        <p className="text-xs text-gray-400">{t.reading_count} readings</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
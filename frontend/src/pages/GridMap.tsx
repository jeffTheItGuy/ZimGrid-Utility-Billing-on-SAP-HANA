import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Map, Search, MapPin, Activity, Zap, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'

export function GridMap() {
  const [assetPage, setAssetPage] = useState(1)
  const [region, setRegion] = useState('')

  const { data: assets, isLoading: assetsLoading } = useQuery(['grid-assets', assetPage, region], () =>
    api.get('/operations/grid-assets', { params: { page: assetPage, limit: 50, region: region || undefined } }).then(r => r.data)
  )

  const { data: outages, isLoading: outagesLoading } = useQuery(['outages'], () =>
    api.get('/operations/outages', { params: { status: 'ACTIVE' } }).then(r => r.data)
  )

  const gridAssets = assets?.data || []
  const activeOutages = outages || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Grid Asset Map</h2>
        <p className="text-gray-500 mt-1">Spatial view of substations, transformers, and outage zones</p>
      </div>

      {/* Outages Alert */}
      {activeOutages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Active Outages ({activeOutages.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeOutages.map((o: any) => (
              <div key={o.outage_id} className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-gray-900">{o.outage_number}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">{o.outage_type}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Region: {o.affected_region || '—'}</p>
                <p className="text-sm text-gray-600">Customers affected: {o.affected_customers || o.estimated_customers || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">Started: {new Date(o.start_time).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Assets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Map className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-gray-900">Grid Assets</h3>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setAssetPage(1) }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Regions</option>
              <option value="HR">Harare</option>
              <option value="BY">Bulawayo</option>
              <option value="MV">Masvingo</option>
              <option value="ML">Mutare</option>
              <option value="GW">Gweru</option>
            </select>
            <span className="text-sm text-gray-500">{gridAssets.length} assets</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Substation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assetsLoading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">Loading grid assets...</td></tr>
              ) : gridAssets.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">No grid assets found</td></tr>
              ) : gridAssets.map((a: any) => (
                <tr key={a.asset_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{a.asset_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.asset_category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.rated_capacity_kva ? `${a.rated_capacity_kva} kVA` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-xs rounded-full">{a.region_code}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.substation_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${
                      a.maintenance_status === 'OPERATIONAL' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {a.maintenance_status === 'OPERATIONAL' ? <CheckCircle className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      {a.maintenance_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {a.latitude && a.longitude ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {parseFloat(a.latitude).toFixed(4)}, {parseFloat(a.longitude).toFixed(4)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => setAssetPage(p => Math.max(1, p - 1))}
            disabled={assetPage === 1}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {assetPage}</span>
          <button 
            onClick={() => setAssetPage(p => p + 1)}
            disabled={gridAssets.length < 50}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spatial Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">HANA Spatial Integration</h4>
            <p className="text-sm text-blue-700 mt-1">
              Grid assets store locations as <code className="bg-blue-100 px-1 rounded">ST_GEOMETRY(4326)</code> in production. 
              Sub-50ms neighbor queries use spatial indexes for outage impact analysis and crew dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

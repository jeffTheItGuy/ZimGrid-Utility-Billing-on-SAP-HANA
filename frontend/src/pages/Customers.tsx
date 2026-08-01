import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Search, Users, ChevronLeft, ChevronRight, MapPin, Zap, X, Gauge } from 'lucide-react'

export function Customers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const { data, isLoading } = useQuery(['customers', page, search], () =>
    api.get('/customers', { params: { page, limit: 20, search: search || undefined } }).then(r => r.data)
  )

  const { data: installations, isLoading: instLoading } = useQuery(
    ['installations', selectedCustomer?.partner_id],
    () => api.get(`/customers/${selectedCustomer.partner_id}/installations`).then(r => r.data),
    { enabled: !!selectedCustomer }
  )

  const customers = data?.data || []
  const totalPages = Math.ceil((customers.length === 20 ? page * 20 + 1 : page * 20) / 20)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <p className="text-gray-500 mt-1">Business partners, contract accounts, and service locations</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or partner number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-sm text-gray-500">{customers.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No customers found</td></tr>
              ) : customers.map((c: any) => (
                <tr key={c.partner_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{c.partner_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {c.first_name} {c.last_name}
                    {c.organization_name && <span className="text-gray-500 block text-xs">{c.organization_name}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.phone_primary}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">{c.customer_class}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setSelectedCustomer(c)}
                      className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                      View Installations
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
            disabled={customers.length < 20}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCustomer && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-sky-600" />
              <h3 className="font-semibold text-gray-900">
                Installations — {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {instLoading ? (
            <p className="text-sm text-gray-400">Loading installations...</p>
          ) : !installations || installations.length === 0 ? (
            <p className="text-sm text-gray-400">No installations found for this customer.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installations.map((inst: any) => (
                <div key={inst.installation_id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-sky-600" />
                    <span className="font-mono text-sm font-medium">{inst.installation_number}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="text-gray-400">Meter:</span> {inst.equipment_number}</p>
                    <p><span className="text-gray-400">Type:</span> {inst.meter_type}</p>
                    <p><span className="text-gray-400">Connection:</span> {inst.connection_type}</p>
                    <p><span className="text-gray-400">Status:</span> 
                      <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${inst.connection_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {inst.connection_status}
                      </span>
                    </p>
                    <p><span className="text-gray-400">Load:</span> {inst.connected_load_kw} kW</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

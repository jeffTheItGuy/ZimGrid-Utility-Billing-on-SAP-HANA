import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../services/api'
import { CreditCard, Search, ChevronLeft, ChevronRight, Zap, CheckCircle, Clock, Hash, DollarSign } from 'lucide-react'

export function Prepaid() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showVendModal, setShowVendModal] = useState(false)

  const [vendForm, setVendForm] = useState({
    meter_serial: '',
    amount: '',
    payment_method: 'CASH',
    payment_reference: ''
  })

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['prepaid-tokens', page, search], () =>
    api.get('/prepaid/tokens', { params: { page, limit: 20, meter_serial: search || undefined } }).then(r => r.data)
  )

  const vendMutation = useMutation(
    (payload: any) => api.post('/prepaid/vend-token', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('prepaid-tokens')
        setShowVendModal(false)
        setVendForm({ meter_serial: '', amount: '', payment_method: 'CASH', payment_reference: '' })
      }
    }
  )

  const tokens = data?.data || []

  const handleVend = (e: React.FormEvent) => {
    e.preventDefault()
    vendMutation.mutate({
      ...vendForm,
      amount: parseFloat(vendForm.amount)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prepaid Token Management</h2>
          <p className="text-gray-500 mt-1">Token vending, redemption tracking, and idempotency monitor</p>
        </div>
        <button 
          onClick={() => setShowVendModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
        >
          <Zap className="w-4 h-4" /> Vend Token
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by meter serial..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <span className="text-sm text-gray-500">{tokens.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter Serial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">kWh Credited</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading tokens...</td></tr>
              ) : tokens.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No tokens found</td></tr>
              ) : tokens.map((t: any) => (
                <tr key={t.token_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{t.token_number}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{t.meter_serial}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${parseFloat(t.purchase_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{parseFloat(t.kwh_credited).toFixed(1)} kWh</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      t.status === 'ISSUED' ? 'bg-green-100 text-green-800' : 
                      t.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status === 'ISSUED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {t.issued_at ? new Date(t.issued_at).toLocaleDateString() : '—'}
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
            disabled={tokens.length < 20}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vend Modal */}
      {showVendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Vend Prepaid Token</h3>
              <button onClick={() => setShowVendModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handleVend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meter Serial</label>
                <input 
                  required
                  value={vendForm.meter_serial}
                  onChange={e => setVendForm(f => ({ ...f, meter_serial: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="SEC-12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input 
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={vendForm.amount}
                  onChange={e => setVendForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={vendForm.payment_method}
                  onChange={e => setVendForm(f => ({ ...f, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="ECOCASH">EcoCash</option>
                  <option value="ZIPIT">ZIPIT</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference</label>
                <input 
                  required
                  value={vendForm.payment_reference}
                  onChange={e => setVendForm(f => ({ ...f, payment_reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="EC-99281"
                />
              </div>

              <button 
                type="submit"
                disabled={vendMutation.isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {vendMutation.isLoading ? 'Processing...' : 'Vend Token'}
              </button>

              {vendMutation.isError && (
                <p className="text-sm text-red-600 text-center">Vend failed. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { Search, Receipt, ChevronLeft, ChevronRight, Calendar, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  '00': { label: 'Open', color: 'bg-amber-100 text-amber-800', icon: Clock },
  '01': { label: 'Partial', color: 'bg-blue-100 text-blue-800', icon: DollarSign },
  '02': { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
}

export function Billing() {
  const [page, setPage] = useState(1)
  const [accountId, setAccountId] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery(['billing', page, accountId, status], () =>
    api.get('/billing/documents', { 
      params: { page, limit: 20, account_id: accountId || undefined, status: status || undefined } 
    }).then(r => r.data)
  )

  const bills = data || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing Documents</h2>
        <p className="text-gray-500 mt-1">Invoice generation, line items, and payment tracking</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by account ID..."
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="00">Open</option>
            <option value="01">Partial</option>
            <option value="02">Paid</option>
          </select>
          <span className="text-sm text-gray-500 ml-auto">{bills.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Loading bills...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No billing documents found</td></tr>
              ) : bills.map((b: any) => {
                const s = statusMap[b.payment_status] || { label: b.payment_status, color: 'bg-gray-100 text-gray-600', icon: AlertCircle }
                const Icon = s.icon
                return (
                  <tr key={b.bill_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">{b.bill_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.contract_account_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {b.bill_period_from} → {b.bill_period_to}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${parseFloat(b.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${s.color}`}>
                        <Icon className="w-3 h-3" /> {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{b.due_date}</td>
                  </tr>
                )
              })}
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
            disabled={bills.length < 20}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

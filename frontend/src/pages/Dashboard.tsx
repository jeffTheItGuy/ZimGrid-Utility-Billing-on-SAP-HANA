import { useQuery } from 'react-query'
import { api } from '../services/api'
import { StatCard } from '../components/dashboard/StatCard'
import { ConsumptionChart } from '../components/charts/ConsumptionChart'
import { RevenueChart } from '../components/charts/RevenueChart'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { Users, Zap, Receipt, AlertTriangle } from 'lucide-react'

export function Dashboard() {
  const { data: stats } = useQuery('dashboard-stats', () =>
    api.get('/operations/system-health').then((r) => r.data)
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operations Overview</h2>
        <p className="text-gray-500">Real-time utility billing metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Customers" value="1,247,832" change="+2.3%" icon={Users} trend="up" />
        <StatCard title="Meters Online" value="1,198,401" change="+0.8%" icon={Zap} trend="up" />
        <StatCard title="Monthly Revenue" value="$42.7M" change="+5.1%" icon={Receipt} trend="up" />
        <StatCard title="Active Outages" value="3" change="-2" icon={AlertTriangle} trend="down" alert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Consumption Trend (GWh)</h3>
          <ConsumptionChart />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Region</h3>
          <RevenueChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">HANA Primary — Harare DC</p>
                <p className="text-sm text-green-700">Memory: 1.2TB / 2TB · CPU: 34%</p>
              </div>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">HANA Secondary — Bulawayo DR</p>
                <p className="text-sm text-green-700">Replication lag: 12s · Sync: Active</p>
              </div>
              <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">Replicating</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Last Backup</p>
                <p className="text-sm text-blue-700">Full backup: 02:00 today · Size: 847GB · Verified</p>
              </div>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Current</span>
            </div>
          </div>
        </div>
        <RecentActivity />
      </div>
    </div>
  )
}

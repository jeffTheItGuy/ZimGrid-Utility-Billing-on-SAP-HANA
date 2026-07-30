import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  trend: 'up' | 'down'
  alert?: boolean
}

export function StatCard({ title, value, change, icon: Icon, trend, alert }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${alert ? 'bg-red-50' : 'bg-sky-50'}`}>
          <Icon className={`w-6 h-6 ${alert ? 'text-red-600' : 'text-sky-600'}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          alert ? 'text-red-600' : trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

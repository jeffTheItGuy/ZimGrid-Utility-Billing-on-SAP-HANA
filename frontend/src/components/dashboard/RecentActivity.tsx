import { Clock, FileText, CreditCard, AlertCircle } from 'lucide-react'

const activities = [
  { icon: FileText, text: 'Bill #B-2026-78432 generated for Account #CA-118293', time: '2 min ago', type: 'billing' },
  { icon: CreditCard, text: 'Payment $127.50 received via EcoCash (Ref: EC-99281)', time: '5 min ago', type: 'payment' },
  { icon: AlertCircle, text: 'Delta merge completed on meter_readings (2.1M records)', time: '12 min ago', type: 'system' },
  { icon: FileText, text: 'Token #TK-77291 issued for Meter #M-992817', time: '18 min ago', type: 'prepaid' },
  { icon: AlertCircle, text: 'Replication lag spike detected: 45s (now resolved)', time: '25 min ago', type: 'alert' },
]

export function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              activity.type === 'alert' ? 'bg-red-50' :
              activity.type === 'system' ? 'bg-amber-50' :
              activity.type === 'payment' ? 'bg-green-50' : 'bg-sky-50'
            }`}>
              <activity.icon className={`w-4 h-4 ${
                activity.type === 'alert' ? 'text-red-600' :
                activity.type === 'system' ? 'text-amber-600' :
                activity.type === 'payment' ? 'text-green-600' : 'text-sky-600'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.text}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

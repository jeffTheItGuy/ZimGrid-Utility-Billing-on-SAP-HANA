import { NavLink } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { 
  LayoutDashboard, 
  Users, 
  Gauge, 
  Receipt, 
  CreditCard, 
  Map, 
  Activity, 
  Database 
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/meters', label: 'Meters & Readings', icon: Gauge },
  { path: '/billing', label: 'Billing Documents', icon: Receipt },
  { path: '/prepaid', label: 'Prepaid Tokens', icon: CreditCard },
  { path: '/grid-map', label: 'Grid Map', icon: Map },
  { path: '/operations', label: 'DBA Operations', icon: Database },
]

export function Sidebar() {
  const { data: health } = useQuery('sidebar-health', () =>
    api.get('/health').then((r) => r.data),
    { refetchInterval: 30000 }
  )

  const isHana = health?.landscape === 'SAP_HANA_PROD'
  const iconSrc = `${import.meta.env.BASE_URL}icon.svg`

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="w-8 h-8"
        />

        <div>
          <h1 className="font-bold text-lg leading-tight">ZESA Billing</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity
            className={`w-4 h-4 ${
              health?.status === 'ok' ? 'text-green-400' : 'text-red-400'
            }`}
          />
          <span>
            {isHana ? 'HANA Primary — Harare' : 'PostgreSQL — Dev Mode'}
          </span>
        </div>

        {isHana && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Activity className="w-4 h-4 text-green-400" />
            <span>Replication — Bulawayo</span>
          </div>
        )}

        <div className="pt-2">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
              isHana
                ? 'bg-purple-900 text-purple-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {health?.landscape || 'POSTGRESQL_DEV'}
          </span>
        </div>
      </div>
    </aside>
  )
}
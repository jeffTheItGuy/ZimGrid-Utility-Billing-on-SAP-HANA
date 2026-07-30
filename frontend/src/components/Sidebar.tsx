import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Gauge, Receipt, CreditCard, 
  Zap, Map, Activity, Database 
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/meters', label: 'Meters & Readings', icon: Gauge },
  { path: '/billing', label: 'Billing Documents', icon: Receipt },
  { path: '/prepaid', label: 'Prepaid Tokens', icon: CreditCard },
  { path: '/grid-map', label: 'Grid Map', icon: Map },
  { path: '/operations', label: 'DBA Operations', icon: Database },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <Zap className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="font-bold text-lg leading-tight">ZESA Billing</h1>
          <p className="text-xs text-slate-400">SAP HANA Ops</p>
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

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Activity className="w-4 h-4 text-green-400" />
          <span>HANA Primary — Harare</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Activity className="w-4 h-4 text-green-400" />
          <span>Replication — Bulawayo</span>
        </div>
      </div>
    </aside>
  )
}

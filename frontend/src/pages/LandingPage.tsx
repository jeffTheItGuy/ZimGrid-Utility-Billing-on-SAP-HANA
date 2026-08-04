import { useNavigate } from 'react-router-dom'
import { Zap, ArrowRight, Database, Activity, Map, Server, AlertTriangle } from 'lucide-react'

const highlights = [
  { icon: Database, text: 'Backup monitoring' },
  { icon: Map, text: 'Grid asset mapping with outage impact' },
  { icon: Server, text: 'End-to-end billing and prepaid workflows' },
  { icon: Activity, text: 'Real-time system health dashboard' },
]

const quickLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: Activity },
  { label: 'DBA Ops', path: '/operations', icon: Database },
  { label: 'Grid Map', path: '/grid-map', icon: Map },
  { label: 'Billing', path: '/billing', icon: Server },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top banner */}
      <div className="bg-amber-400 text-amber-950 px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        Demo portfolio project — not an official ZESA application
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold uppercase tracking-wide">
              <Zap className="w-3 h-3" /> Portfolio Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              ZESA Billing Operations
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              A React + TypeScript dashboard demonstrating DBA skills. It uses a PostgreSQL database with a HANA-compatible schema.
            </p>
            
            {/* FIXED LINE BELOW */}
            <p className="text-slate-600">
              <strong>Full Repo: </strong>
              <a 
                href="https://github.com/jeffTheItGuy/ZimGrid-Utility-Billing-on-SAP-HANA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline font-medium"
              >
                ZimGrid-Utility-Billing-on-SAP-HANA
              </a>
            </p>
          </div>

          {/* Job context card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="font-semibold">Database showcase</h2>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded font-medium">
                Fixed-Term
              </span>
            </div>

            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Demo Highlights</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-slate-600">
                {highlights.map((item) => (
                  <li key={item.text} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-sky-600 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="group inline-flex items-center gap-2 px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-sky-200 transition-all"
            >
              Enter Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-slate-400">No login required — click any nav item to explore.</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-sky-300 hover:text-sky-700 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
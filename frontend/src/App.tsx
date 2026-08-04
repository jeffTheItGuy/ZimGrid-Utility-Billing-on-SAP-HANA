import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LandingPage } from './pages/LandingPage'
import { Dashboard } from './pages/Dashboard'
import { Customers } from './pages/Customers'
import { Meters } from './pages/Meters'
import { Billing } from './pages/Billing'
import { Prepaid } from './pages/Prepaid'
import { OperationsCenter } from './pages/OperationsCenter'
import { GridMap } from './pages/GridMap'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/meters" element={<Meters />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/prepaid" element={<Prepaid />} />
        <Route path="/operations" element={<OperationsCenter />} />
        <Route path="/grid-map" element={<GridMap />} />
      </Route>
    </Routes>
  )
}

export default App
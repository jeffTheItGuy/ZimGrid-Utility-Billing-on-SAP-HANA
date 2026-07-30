import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', consumption: 420 },
  { month: 'Feb', consumption: 380 },
  { month: 'Mar', consumption: 450 },
  { month: 'Apr', consumption: 510 },
  { month: 'May', consumption: 580 },
  { month: 'Jun', consumption: 620 },
  { month: 'Jul', consumption: 680 },
  { month: 'Aug', consumption: 710 },
  { month: 'Sep', consumption: 650 },
  { month: 'Oct', consumption: 540 },
  { month: 'Nov', consumption: 460 },
  { month: 'Dec', consumption: 410 },
]

export function ConsumptionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Line type="monotone" dataKey="consumption" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

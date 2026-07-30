import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { region: 'Harare', usd: 18.2, zig: 2.1 },
  { region: 'Bulawayo', usd: 8.4, zig: 0.9 },
  { region: 'Manicaland', usd: 4.1, zig: 0.5 },
  { region: 'Masvingo', usd: 3.8, zig: 0.4 },
  { region: 'Mashonaland', usd: 5.2, zig: 0.6 },
  { region: 'Matebeleland', usd: 3.0, zig: 0.3 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="region" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
        <Bar dataKey="usd" fill="#0284c7" radius={[4, 4, 0, 0]} name="USD ($M)" />
        <Bar dataKey="zig" fill="#84cc16" radius={[4, 4, 0, 0]} name="ZiG ($M)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

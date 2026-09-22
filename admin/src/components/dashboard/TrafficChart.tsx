import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { DailyTraffic } from '@/types/analytics.types'

interface TrafficChartProps {
  data?: DailyTraffic[]
}

export default function TrafficChart({ data }: TrafficChartProps) {
  const chartData = (data ?? []).map((d) => ({
    date: new Date(d.day).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    sessions: d.sessions,
    pageviews: d.pageviews,
  }))

  if (chartData.length === 0) {
    return <div className="py-20 text-center text-[13px] text-navy/30 font-bold">Aucune donnée de trafic disponible.</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-6 mb-8">
        {[
          { color: '#1557E8', label: 'Sessions' },
          { color: '#F59E0B', label: 'Pages vues' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-4 h-1 rounded-full" style={{ background: color }} />
            <span className="text-[11px] font-black text-navy/40 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '20px', border: 'none',
              fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Line type="monotone" dataKey="sessions"  stroke="#1557E8" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="pageviews" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DeviceStats } from '@/types/analytics.types'

interface DeviceDonutProps {
  data?: DeviceStats
}

export default function DeviceDonut({ data }: DeviceDonutProps) {
  const total = data ? data.desktop + data.mobile + data.tablette + data.unknown : 0

  const chartData = data ? [
    { name: 'Desktop',  value: data.desktop,  color: '#1557E8' },
    { name: 'Mobile',   value: data.mobile,   color: '#F59E0B' },
    { name: 'Tablette', value: data.tablette,  color: '#475569' },
    { name: 'Autre',    value: data.unknown,   color: '#94A3B8' },
  ].filter((d) => d.value > 0) : []

  if (chartData.length === 0) {
    return <div className="py-20 text-center text-[13px] text-navy/30 font-bold">Aucune donnée disponible.</div>
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map(({ color }, i) => (
              <Cell
                key={i}
                fill={color}
                className="hover:opacity-80 transition-opacity duration-300 outline-none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`${total > 0 ? Math.round((v / total) * 100) : 0}%`, 'Part']}
            contentStyle={{
              borderRadius: '16px', border: 'none',
              fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Legend
            iconType="circle"
            iconSize={10}
            verticalAlign="bottom"
            formatter={(v) => (
              <span className="text-[11px] font-black text-navy/40 uppercase tracking-wider ml-1">
                {v}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

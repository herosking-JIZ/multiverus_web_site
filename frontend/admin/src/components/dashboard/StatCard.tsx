import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  titre: string
  valeur: string | number
  evolution?: number  // % positif = hausse, négatif = baisse
  icon: React.ReactNode
  accent?: boolean
}

export default function StatCard({ titre, valeur, evolution, icon, accent = false }: StatCardProps) {
  const up   = evolution !== undefined && evolution > 0
  const down = evolution !== undefined && evolution < 0

  return (
    <div className={cn(
      'rounded-[32px] p-7 flex flex-col gap-5 transition-all duration-300 transform hover:-translate-y-2',
      accent 
        ? 'bg-navy text-white shadow-[0_20px_40px_-12px_rgba(3,8,22,0.3)] border border-navy' 
        : 'glass-premium'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={cn('text-[11px] font-black uppercase tracking-[0.1em]', accent ? 'text-white/40' : 'text-navy/40')}>
          {titre}
        </span>
        <div className={cn('w-10 h-10 rounded-2xl grid place-items-center transition-transform hover:scale-110', accent ? 'bg-white/10' : 'bg-navy/5')}>
          <span className={accent ? 'text-or' : 'text-navy'}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className={cn('font-black text-[42px] leading-none tracking-tight font-condensed', accent ? 'text-white' : 'text-navy')}>
        {valeur}
      </div>

      {/* Trend */}
      {evolution !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 text-[11px] font-black tracking-tight',
          up ? 'text-emerald-500' : down ? 'text-red-500' : 'text-navy/30'
        )}>
          <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', up ? 'bg-emerald-500/10' : down ? 'bg-red-500/10' : 'bg-navy/5')}>
            {up ? <TrendingUp size={12} /> : down ? <TrendingDown size={12} /> : <Minus size={12} />}
          </div>
          <span>{up ? '+' : ''}{evolution}% <span className="font-medium opacity-60">vs période préc.</span></span>
        </div>
      )}
    </div>
  )
}

import { useQuery } from '@tanstack/react-query'
import { BarChart2, Users, Mail, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { getDashboardAnalytics } from '@/services/analytics.service'
import StatCard from '@/components/dashboard/StatCard'
import TrafficChart from '@/components/dashboard/TrafficChart'
import DeviceDonut from '@/components/dashboard/DeviceDonut'
import TopPagesTable from '@/components/dashboard/TopPagesTable'

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => getDashboardAnalytics(),
    staleTime: 5 * 60 * 1000, // 5min cache
  })

  const analytics = data?.data

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 size={40} className="animate-spin text-vivid" />
        <span className="text-[14px] font-bold text-navy/30">Chargement du tableau de bord…</span>
      </div>
    )
  }

  if (isError || !analytics) {
    return (
      <div className="glass-premium rounded-[40px] p-16 text-center">
        <div className="text-red-500 font-bold text-[18px] mb-2">Erreur de chargement</div>
        <div className="text-[13px] text-navy/40">Impossible de récupérer les données analytiques.</div>
      </div>
    )
  }

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const STATS = [
    { titre: 'Visiteurs uniques', valeur: analytics.visiteurs_uniques.toLocaleString('fr-FR'), icon: <Users size={16} />, accent: true },
    { titre: 'Pages vues',        valeur: analytics.pages_vues.toLocaleString('fr-FR'),        icon: <BarChart2 size={16} /> },
    { titre: 'Nouveaux leads',    valeur: String(analytics.nouveaux_leads),                    icon: <Mail size={16} /> },
    { titre: 'Durée moyenne',     valeur: formatDuration(analytics.duree_moyenne_secondes),    icon: <Clock size={16} /> },
    { titre: 'Taux de rebond',    valeur: `${analytics.taux_rebond_pct}%`,                     icon: <TrendingUp size={16} /> },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <div className="glass-premium rounded-[40px] p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-black text-[20px] text-navy font-condensed tracking-tight">Trafic & Performance</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-navy/5 text-[11px] font-bold text-navy/40">30 JOURS</span>
            </div>
          </div>
          <TrafficChart data={analytics.trafic_journalier} />
        </div>

        <div className="glass-premium rounded-[40px] p-8 shadow-sm">
          <h3 className="font-black text-[18px] text-navy mb-6 font-condensed tracking-tight">Appareils</h3>
          <DeviceDonut data={analytics.appareils} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass-premium rounded-[40px] p-8 shadow-sm">
          <h3 className="font-black text-[18px] text-navy mb-6 font-condensed tracking-tight">Pages les plus visitées</h3>
          <TopPagesTable data={analytics.top_pages} />
        </div>

        <div className="glass-premium rounded-[40px] p-8 shadow-sm">
          <h3 className="font-black text-[18px] text-navy mb-6 font-condensed tracking-tight">Sources de trafic</h3>
          <div className="space-y-3">
            {analytics.sources_trafic.map(({ source, visits }) => (
              <div key={source} className="flex items-center justify-between py-3 border-b border-navy/5 last:border-0">
                <span className="text-[14px] font-bold text-navy">{source}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-navy/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-vivid"
                      style={{ width: `${Math.min(100, (visits / (analytics.sources_trafic[0]?.visits || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-mono text-navy/40 w-12 text-right">{visits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

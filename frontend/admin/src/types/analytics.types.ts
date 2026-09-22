export interface TopPage {
  path: string
  views: number
}

export interface DeviceStats {
  desktop: number
  mobile: number
  tablette: number
  unknown: number
}

export interface DailyTraffic {
  day: string
  pageviews: number
  sessions: number
}

export interface TrafficSource {
  source: string
  visits: number
}

export interface AnalyticsDashboard {
  periode: { from: string; to: string }
  visiteurs_uniques: number
  pages_vues: number
  duree_moyenne_secondes: number
  taux_rebond_pct: number
  top_pages: TopPage[]
  nouveaux_leads: number
  appareils: DeviceStats
  trafic_journalier: DailyTraffic[]
  sources_trafic: TrafficSource[]
  telechargements: number
}

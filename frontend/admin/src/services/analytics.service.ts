import adminApi from '@/lib/axios'
import type { AnalyticsDashboard } from '@/types/analytics.types'

export const getDashboardAnalytics = (params?: { from?: string; to?: string }) =>
  adminApi
    .get<{ success: boolean; data: AnalyticsDashboard }>('/admin/analytics/dashboard', { params })
    .then((r) => r.data)

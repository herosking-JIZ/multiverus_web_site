import adminApi from '@/lib/axios'
import type { Lead, LeadStatut, PaginatedResponse } from '@/types/lead.types'

export const getLeads = (params?: {
  statut?: LeadStatut
  page?: number
  limit?: number
  from?: string
  to?: string
}) =>
  adminApi.get<PaginatedResponse<Lead>>('/admin/leads', { params }).then((r) => r.data)

export const getLeadById = (id: string) =>
  adminApi.get<{ success: boolean; data: Lead }>(`/admin/leads/${id}`).then((r) => r.data)

export const updateLeadStatus = (id: string, statut: LeadStatut) =>
  adminApi.patch<{ success: boolean; data: Lead }>(`/admin/leads/${id}/statut`, { statut }).then((r) => r.data)

export const updateLeadNotes = (id: string, notes: string) =>
  adminApi.patch<{ success: boolean; data: Lead }>(`/admin/leads/${id}/notes`, { notes }).then((r) => r.data)

export const deleteLead = (id: string) =>
  adminApi.delete(`/admin/leads/${id}`).then((r) => r.data)

export const exportLeadsCsv = (params?: { statut?: LeadStatut; from?: string; to?: string }) =>
  adminApi.get('/admin/leads/export', { params, responseType: 'blob' }).then((r) => {
    const url = window.URL.createObjectURL(new Blob([r.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  })

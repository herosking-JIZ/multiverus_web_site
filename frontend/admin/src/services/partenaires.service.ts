import adminApi from '@/lib/axios'
import type { Partenaire, CreatePartenairePayload, UpdatePartenairePayload } from '@/types/partenaire.types'
import type { PaginatedResponse } from '@/types/lead.types'

export const getPartenaires = (params?: { page?: number; limit?: number; actif?: boolean }) =>
  adminApi.get<PaginatedResponse<Partenaire>>('/admin/partenaires', { params }).then((r) => r.data)

export const getPartenaireById = (id: string) =>
  adminApi.get<Partenaire>(`/admin/partenaires/${id}`).then((r) => r.data)

export const createPartenaire = (payload: CreatePartenairePayload) =>
  adminApi.post<Partenaire>('/admin/partenaires', payload).then((r) => r.data)

export const updatePartenaire = (id: string, payload: UpdatePartenairePayload) =>
  adminApi.patch<Partenaire>(`/admin/partenaires/${id}`, payload).then((r) => r.data)

export const deletePartenaire = (id: string) =>
  adminApi.delete(`/admin/partenaires/${id}`).then((r) => r.data)

export const reorderPartenaires = (ids: string[]) =>
  adminApi.patch('/admin/partenaires/reorder', { ids }).then((r) => r.data)

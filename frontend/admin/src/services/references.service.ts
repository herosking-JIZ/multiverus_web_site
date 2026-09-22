import adminApi from '@/lib/axios'
import type { Reference, CreateReferencePayload, UpdateReferencePayload } from '@/types/reference.types'
import type { PaginatedResponse } from '@/types/lead.types'

export const getReferences = (params?: { page?: number; limit?: number; secteur?: string; publie?: boolean }) =>
  adminApi.get<PaginatedResponse<Reference>>('/admin/references', { params }).then((r) => r.data)

export const getReferenceById = (id: string) =>
  adminApi.get<Reference>(`/admin/references/${id}`).then((r) => r.data)

export const createReference = (payload: CreateReferencePayload) =>
  adminApi.post<Reference>('/admin/references', payload).then((r) => r.data)

export const updateReference = (id: string, payload: UpdateReferencePayload) =>
  adminApi.patch<Reference>(`/admin/references/${id}`, payload).then((r) => r.data)

export const deleteReference = (id: string) =>
  adminApi.delete(`/admin/references/${id}`).then((r) => r.data)

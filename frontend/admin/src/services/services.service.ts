import adminApi from '@/lib/axios'
import type { Service, CreateServicePayload, UpdateServicePayload } from '@/types/service.types'
import type { PaginatedResponse } from '@/types/lead.types'

export const getServices = (params?: { page?: number; limit?: number; actif?: boolean }) =>
  adminApi.get<PaginatedResponse<Service>>('/admin/services', { params }).then((r) => r.data)

export const getServiceById = (id: string) =>
  adminApi.get<Service>(`/admin/services/${id}`).then((r) => r.data)

export const createService = (payload: CreateServicePayload) =>
  adminApi.post<Service>('/admin/services', payload).then((r) => r.data)

export const updateService = (id: string, payload: UpdateServicePayload) =>
  adminApi.patch<Service>(`/admin/services/${id}`, payload).then((r) => r.data)

export const deleteService = (id: string) =>
  adminApi.delete(`/admin/services/${id}`).then((r) => r.data)

export const reorderServices = (ids: string[]) =>
  adminApi.patch('/admin/services/reorder', { ids }).then((r) => r.data)

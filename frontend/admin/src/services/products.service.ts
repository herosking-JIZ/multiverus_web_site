import adminApi from '@/lib/axios'
import type { Product, CreateProductPayload, UpdateProductPayload, ProductStatut } from '@/types/product.types'
import type { PaginatedResponse } from '@/types/lead.types'

export const getProducts = (params?: { page?: number; limit?: number; categorie?: string; statut?: ProductStatut; actif?: boolean }) =>
  adminApi.get<PaginatedResponse<Product>>('/admin/produits', { params }).then((r) => r.data)

export const getProductById = (id: string) =>
  adminApi.get<Product>(`/admin/produits/${id}`).then((r) => r.data)

export const createProduct = (payload: CreateProductPayload) =>
  adminApi.post<Product>('/admin/produits', payload).then((r) => r.data)

export const updateProduct = (id: string, payload: UpdateProductPayload) =>
  adminApi.patch<Product>(`/admin/produits/${id}`, payload).then((r) => r.data)

export const deleteProduct = (id: string) =>
  adminApi.delete(`/admin/produits/${id}`).then((r) => r.data)

import api from '@/lib/axios'
import type { Product } from '@/types/product.types'
import { PRODUCTS_FALLBACK } from '@/constants/products.constants'

export const getProducts = (): Promise<Product[]> =>
  api.get<Product[]>('/produits').then((r) => r.data).catch(() => PRODUCTS_FALLBACK)

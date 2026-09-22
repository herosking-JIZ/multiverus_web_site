import api from '@/lib/axios'
import type { Service } from '@/types/service.types'
import { SERVICES_FALLBACK } from '@/constants/services.constants'

export const getServices = (): Promise<Service[]> =>
  api.get<Service[]>('/services').then((r) => r.data).catch(() => SERVICES_FALLBACK)

export const getServiceBySlug = (slug: string): Promise<Service | undefined> =>
  api.get<Service>(`/services/${slug}`).then((r) => r.data).catch(() =>
    SERVICES_FALLBACK.find((s) => s.slug === slug)
  )

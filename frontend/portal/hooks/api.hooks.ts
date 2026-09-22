import { useQuery, useMutation } from '@tanstack/react-query'
import api, { setCsrfToken } from '@/lib/axios'
import type { Service } from '@/types/service.types'
import type { Product } from '@/types/product.types'
import type { Partner } from '@/types/partner.types'

// --- Interfaces ---

interface ContactData {
  nomComplet: string
  email: string
  organisation?: string
  sujet: string
  message: string
}

// --- Hooks ---

/**
 * Fetch and set the CSRF token
 */
export const useCsrfToken = () => {
  return useQuery({
    queryKey: ['csrf-token'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; csrfToken: string }>('/csrf-token')
      if (response.data.success) {
        setCsrfToken(response.data.csrfToken)
      }
      return response.data.csrfToken
    },
  })
}

/**
 * Get all active services
 */
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Service[] }>('/services')
      return response.data.data
    },
  })
}

/**
 * Get all active products
 */
export const useProduits = () => {
  return useQuery({
    queryKey: ['produits'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Product[] }>('/produits')
      return response.data.data
    },
  })
}

/**
 * Get all active partners
 */
export const usePartenaires = () => {
  return useQuery({
    queryKey: ['partenaires'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Partner[] }>('/partenaires')
      return response.data.data
    },
  })
}

/**
 * Preload all data for the app on startup
 * This ensures all API calls are made once and cached for the session
 * Uses aggressive caching to prevent refetches on navigation
 */
export const usePreloadData = () => {
  // Trigger all queries with aggressive caching
  const csrfQuery = useCsrfToken()
  const servicesQuery = useServices()
  const produitsQuery = useProduits()
  const partenairesQuery = usePartenaires()

  return {
    isLoading: 
      csrfQuery.isLoading || 
      servicesQuery.isLoading || 
      produitsQuery.isLoading || 
      partenairesQuery.isLoading,
    isError: 
      csrfQuery.isError || 
      servicesQuery.isError || 
      produitsQuery.isError || 
      partenairesQuery.isError,
  }
}

/**
 * Submit contact form
 */
export const useSubmitContact = () => {
  return useMutation({
    mutationFn: async (data: ContactData) => {
      const response = await api.post<{ success: boolean; message: string }>('/contact', data)
      return response.data
    },
  })
}

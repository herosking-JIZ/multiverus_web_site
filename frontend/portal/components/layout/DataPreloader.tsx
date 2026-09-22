'use client'

import { useEffect, useState } from 'react'
import { queryClient } from '@/lib/queryClient'
import api from '@/lib/axios'
import type { Service } from '@/types/service.types'
import type { Product } from '@/types/product.types'
import type { Partner } from '@/types/partner.types'

/**
 * DataPreloader component
 * - Preloads all API data on app startup
 * - Manually sets cache to ensure data is available
 * - Eliminates unnecessary API calls on navigation
 */
export default function DataPreloader() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const preloadData = async () => {
      try {
        console.log('[DataPreloader] Starting preload of all data...')
        
        // Fetch all data in parallel
        const [servicesRes, produitsRes, partenairesRes] = await Promise.all([
          api.get<{ success: boolean; data: Service[] }>('/services'),
          api.get<{ success: boolean; data: Product[] }>('/produits'),
          api.get<{ success: boolean; data: Partner[] }>('/partenaires'),
        ])

        // Manually set cache for each query
        queryClient.setQueryData(['services'], servicesRes.data.data)
        queryClient.setQueryData(['produits'], produitsRes.data.data)
        queryClient.setQueryData(['partenaires'], partenairesRes.data.data)

        console.log('[DataPreloader] All data preloaded successfully ✓')
        setLoaded(true)
      } catch (error) {
        console.error('[DataPreloader] Error preloading data:', error)
        setLoaded(true) // Still mark as loaded to not block the app
      }
    }

    preloadData()
  }, [])

  // Return nothing, but hook is running
  return null
}

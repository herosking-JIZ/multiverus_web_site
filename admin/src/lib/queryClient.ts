import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 min pour l'admin (données plus fraîches)
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

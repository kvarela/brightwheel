import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import type { School } from '../types/School'

export function useSchools() {
  return useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: async () => {
      const response = await apiClient.get<School[]>('/api/schools')
      return response.data
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import type { School } from '../types/School'

export function useSchools(search?: string) {
  return useQuery<School[]>({
    queryKey: ['schools', search ?? ''],
    queryFn: async () => {
      const params = search ? { search } : {}
      const response = await apiClient.get<School[]>('/api/schools', { params })
      return response.data
    },
  })
}

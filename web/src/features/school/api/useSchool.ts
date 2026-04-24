import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import type { School } from '../types/School'

export function useSchool(schoolId: string | undefined) {
  return useQuery<School>({
    queryKey: ['school', schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const response = await apiClient.get<School>(`/api/schools/${schoolId}`)
      return response.data
    },
  })
}

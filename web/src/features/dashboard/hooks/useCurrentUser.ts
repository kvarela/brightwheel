import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import { CurrentUser } from '../types/CurrentUser'

async function fetchCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>('/api/auth/me')
  return data
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'

interface UnreadCountResponse {
  unreadCount: number
}

export const unreadCountQueryKey = ['notifications', 'unread-count']

export function useUnreadCount(enabled: boolean) {
  return useQuery<UnreadCountResponse>({
    queryKey: unreadCountQueryKey,
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<UnreadCountResponse>(
        '/api/notifications/unread-count',
      )
      return response.data
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import type { ChatSessionDto, InboxState } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'

export function conversationsQueryKey(inboxState?: InboxState) {
  return ['conversations', inboxState ?? 'all']
}

export function useConversations(inboxState?: InboxState) {
  return useQuery<ChatSessionDto[]>({
    queryKey: conversationsQueryKey(inboxState),
    queryFn: async () => {
      const response = await apiClient.get<ChatSessionDto[]>(
        `/api/chat/conversations`,
        { params: inboxState ? { inboxState } : undefined },
      )
      return response.data
    },
  })
}

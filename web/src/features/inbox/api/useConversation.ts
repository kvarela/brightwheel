import { useQuery } from '@tanstack/react-query'
import type { ChatMessageDto, ChatSessionDto } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'

interface ConversationResponse {
  session: ChatSessionDto
  messages: ChatMessageDto[]
}

export function conversationQueryKey(id: string | undefined) {
  return ['conversation', id]
}

export function useConversation(id: string | undefined) {
  return useQuery<ConversationResponse>({
    queryKey: conversationQueryKey(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiClient.get<ConversationResponse>(
        `/api/chat/conversations/${id}`,
      )
      return response.data
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatMessageDto } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'
import { conversationQueryKey } from './useConversation'

interface Params {
  conversationId: string
  content: string
}

export function useStaffReply() {
  const queryClient = useQueryClient()
  return useMutation<ChatMessageDto, Error, Params>({
    mutationFn: async ({ conversationId, content }) => {
      const response = await apiClient.post<ChatMessageDto>(
        `/api/chat/conversations/${conversationId}/replies`,
        { content },
      )
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationQueryKey(variables.conversationId),
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

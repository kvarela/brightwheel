import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatSessionDto, InboxState } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'
import { conversationQueryKey } from './useConversation'

interface Params {
  conversationId: string
  inboxState: InboxState
}

export function useUpdateInboxState() {
  const queryClient = useQueryClient()
  return useMutation<ChatSessionDto, Error, Params>({
    mutationFn: async ({ conversationId, inboxState }) => {
      const response = await apiClient.patch<ChatSessionDto>(
        `/api/chat/conversations/${conversationId}/state`,
        { inboxState },
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

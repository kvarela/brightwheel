import { useMutation } from '@tanstack/react-query'
import type { SendMessageResponseDto } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'

interface Params {
  sessionToken: string
  content: string
}

export function useSendMessage() {
  return useMutation<SendMessageResponseDto, Error, Params>({
    mutationFn: async ({ sessionToken, content }) => {
      const response = await apiClient.post<SendMessageResponseDto>(
        `/api/chat/sessions/${sessionToken}/messages`,
        { content },
      )
      return response.data
    },
  })
}

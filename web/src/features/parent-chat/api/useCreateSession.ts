import { useMutation } from '@tanstack/react-query'
import type { CreateChatSessionResponseDto } from '@brightwheel/shared'
import { apiClient } from '../../../lib/apiClient'

export function useCreateSession() {
  return useMutation<CreateChatSessionResponseDto, Error, { schoolId: string; parentName?: string }>({
    mutationFn: async ({ schoolId, parentName }) => {
      const response = await apiClient.post<CreateChatSessionResponseDto>(
        '/api/chat/sessions',
        { schoolId, parentName },
      )
      return response.data
    },
  })
}

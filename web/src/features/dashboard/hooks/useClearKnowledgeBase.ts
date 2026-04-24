import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'

interface ClearKnowledgeBaseResponse {
  deletedCount: number
}

async function clearKnowledgeBase(): Promise<ClearKnowledgeBaseResponse> {
  const { data } = await apiClient.delete<ClearKnowledgeBaseResponse>('/api/knowledge-base')
  return data
}

export function useClearKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clearKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}

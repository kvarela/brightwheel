import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import { KnowledgeBaseEntry } from '../types/KnowledgeBaseEntry'

export interface CreateKnowledgeBaseEntryInput {
  question: string
  answer: string
}

async function createKnowledgeBaseEntry(
  input: CreateKnowledgeBaseEntryInput,
): Promise<KnowledgeBaseEntry> {
  const { data } = await apiClient.post<KnowledgeBaseEntry>('/api/knowledge-base', input)
  return data
}

export function useCreateKnowledgeBaseEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createKnowledgeBaseEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] })
    },
  })
}

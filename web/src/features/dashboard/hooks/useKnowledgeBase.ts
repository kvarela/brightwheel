import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import { KnowledgeBaseEntry } from '../types/KnowledgeBaseEntry'

async function fetchKnowledgeBase(search: string): Promise<KnowledgeBaseEntry[]> {
  const { data } = await apiClient.get<KnowledgeBaseEntry[]>('/api/knowledge-base', {
    params: search ? { search } : undefined,
  })
  return data
}

export function useKnowledgeBase(search: string) {
  return useQuery({
    queryKey: ['knowledge-base', search],
    queryFn: () => fetchKnowledgeBase(search),
  })
}

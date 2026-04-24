import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import { ChatSession } from '../types/ChatSession'

async function fetchLiveChats(): Promise<ChatSession[]> {
  const { data } = await apiClient.get<ChatSession[]>('/api/chat/sessions')
  return data
}

export function useLiveChats() {
  return useQuery({
    queryKey: ['chat-sessions', 'live'],
    queryFn: fetchLiveChats,
    refetchInterval: 10_000,
  })
}

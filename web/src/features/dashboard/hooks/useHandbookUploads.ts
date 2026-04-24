import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/apiClient'
import { HandbookUpload } from '../types/HandbookUpload'

async function fetchHandbookUploads(): Promise<HandbookUpload[]> {
  const { data } = await apiClient.get<HandbookUpload[]>('/api/handbook-uploads')
  return data
}

export function useHandbookUploads() {
  return useQuery({
    queryKey: ['handbook-uploads'],
    queryFn: fetchHandbookUploads,
  })
}

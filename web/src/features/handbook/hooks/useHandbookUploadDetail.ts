import { useQuery } from '@tanstack/react-query'
import { HandbookUploadDetailDto } from '@brightwheel/shared'
import { getHandbookUploadDetail } from '../api/handbookApi'

export function useHandbookUploadDetail(uploadId: string | undefined) {
  return useQuery<HandbookUploadDetailDto>({
    queryKey: ['handbook-upload-detail', uploadId],
    queryFn: () => getHandbookUploadDetail(uploadId as string),
    enabled: !!uploadId,
  })
}

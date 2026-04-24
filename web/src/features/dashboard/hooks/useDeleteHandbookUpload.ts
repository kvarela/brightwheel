import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteHandbookUpload } from '../../handbook/api/handbookApi'

export function useDeleteHandbookUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uploadId: string) => deleteHandbookUpload(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-uploads'] })
    },
  })
}

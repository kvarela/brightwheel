import { HandbookUploadStatus, HandbookFileType } from '@brightwheel/shared'

export class HandbookUploadResponseDto {
  id: string
  fileName: string
  fileType: HandbookFileType
  status: HandbookUploadStatus
  errorMessage: string | null
  createdAt: Date
  uploadedBy: { id: string; fullName: string; email: string }
}

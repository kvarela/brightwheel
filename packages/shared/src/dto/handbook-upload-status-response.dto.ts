import { HandbookUploadStatus } from '../enums/handbook-upload-status.enum'

export interface HandbookUploadStatusResponseDto {
  uploadId: string
  status: HandbookUploadStatus
  errorMessage: string | null
  inquiriesExtracted: number
}

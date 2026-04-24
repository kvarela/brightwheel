import { HandbookUploadStatus } from '../enums/handbook-upload-status.enum'
import { ExtractedInquiryDto } from './extracted-inquiry.dto'

export interface HandbookProcessResponseDto {
  uploadId: string
  versionId: string
  status: HandbookUploadStatus
  inquiriesExtracted: number
  inquiries: ExtractedInquiryDto[]
}

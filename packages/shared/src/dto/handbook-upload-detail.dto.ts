import { HandbookFileType } from '../enums/handbook-file-type.enum'
import { HandbookUploadStatus } from '../enums/handbook-upload-status.enum'
import { ExtractedInquiryDto } from './extracted-inquiry.dto'

export interface HandbookUploadUploadedByDto {
  id: string
  fullName: string
  email: string
}

export interface HandbookUploadDetailDto {
  id: string
  fileName: string
  fileType: HandbookFileType
  status: HandbookUploadStatus
  errorMessage: string | null
  createdAt: string
  uploadedBy: HandbookUploadUploadedByDto
  inquiries: ExtractedInquiryDto[]
}

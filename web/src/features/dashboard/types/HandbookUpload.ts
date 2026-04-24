export type HandbookUploadStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type HandbookFileType = 'pdf' | 'docx' | 'txt'

export interface UploadedBy {
  id: string
  fullName: string
  email: string
}

export interface HandbookUpload {
  id: string
  fileName: string
  fileType: HandbookFileType
  status: HandbookUploadStatus
  errorMessage: string | null
  createdAt: string
  uploadedBy: UploadedBy
}

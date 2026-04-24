import { HandbookFileType } from '../enums/handbook-file-type.enum'

export interface HandbookSignedUploadRequestDto {
  fileName: string
  fileType: HandbookFileType
  contentType: string
}

import { IsUUID } from 'class-validator'
import { HandbookProcessRequestDto } from '@brightwheel/shared'

export class ProcessHandbookDto implements HandbookProcessRequestDto {
  @IsUUID()
  uploadId: string
}

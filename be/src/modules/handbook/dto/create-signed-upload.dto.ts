import { IsEnum, IsString, Length, MaxLength } from 'class-validator'
import { HandbookFileType, HandbookSignedUploadRequestDto } from '@brightwheel/shared'

export class CreateSignedUploadDto implements HandbookSignedUploadRequestDto {
  @IsString()
  @Length(1, 255)
  fileName: string

  @IsEnum(HandbookFileType)
  fileType: HandbookFileType

  @IsString()
  @MaxLength(255)
  contentType: string
}

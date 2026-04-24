import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'

export class CreateSessionDto {
  @IsUUID()
  schoolId: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  parentName?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  parentEmail?: string
}

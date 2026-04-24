import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateSessionDto {
  @IsString()
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

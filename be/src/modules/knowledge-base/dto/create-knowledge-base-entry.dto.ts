import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateKnowledgeBaseEntryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  answer: string
}

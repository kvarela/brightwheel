import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsOptional()
  @Matches(UUID_REGEX, { message: 'schoolId must be a UUID' })
  schoolId?: string | null

  @ValidateIf((o: RegisterDto) => !o.schoolId)
  @IsString()
  @IsNotEmpty()
  newSchoolName?: string | null
}

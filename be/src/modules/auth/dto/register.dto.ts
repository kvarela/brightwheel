import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator'

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
  @IsUUID()
  schoolId?: string | null

  @ValidateIf((o: RegisterDto) => !o.schoolId)
  @IsString()
  @IsNotEmpty()
  newSchoolName?: string | null
}

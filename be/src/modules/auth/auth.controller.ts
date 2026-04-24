import { Body, Controller, Post, Headers, BadRequestException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Headers('x-school-id') schoolId: string,
  ) {
    if (!schoolId) {
      throw new BadRequestException('x-school-id header is required')
    }
    return this.authService.login(dto, schoolId)
  }
}

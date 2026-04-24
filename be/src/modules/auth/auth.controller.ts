import { Body, Controller, Get, Post, Headers, BadRequestException, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './auth.guard'
import { RequestUser } from './strategies/jwt.strategy'

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: { user: RequestUser }) {
    return this.authService.getMe(req.user.staffUserId)
  }
}

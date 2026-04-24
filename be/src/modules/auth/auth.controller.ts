import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './auth.guard'
import { RequestUser } from './strategies/jwt.strategy'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: { user: RequestUser }) {
    return this.authService.getMe(req.user.staffUserId)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto.email, dto.password)
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto): Promise<{ accessToken: string }> {
    return this.authService.register(
      dto.fullName,
      dto.email,
      dto.password,
      dto.schoolId,
      dto.newSchoolName,
    )
  }
}

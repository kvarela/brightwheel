import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/auth.guard'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { HandbookService } from './handbook.service'

@Controller('handbook-uploads')
@UseGuards(JwtAuthGuard)
export class HandbookController {
  constructor(private readonly handbookService: HandbookService) {}

  @Get()
  getUploads(@Request() req: { user: RequestUser }) {
    return this.handbookService.findBySchool(req.user.schoolId)
  }
}

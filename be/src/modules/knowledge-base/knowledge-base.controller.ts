import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/auth.guard'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { KnowledgeBaseService } from './knowledge-base.service'

@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get()
  getEntries(
    @Request() req: { user: RequestUser },
    @Query('search') search?: string,
  ) {
    return this.kbService.findBySchool(req.user.schoolId, search)
  }
}

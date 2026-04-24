import { Body, Controller, Delete, Get, Post, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/auth.guard'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { KnowledgeBaseService } from './knowledge-base.service'
import { CreateKnowledgeBaseEntryDto } from './dto/create-knowledge-base-entry.dto'

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

  @Post()
  createEntry(
    @Request() req: { user: RequestUser },
    @Body() dto: CreateKnowledgeBaseEntryDto,
  ) {
    return this.kbService.create(req.user.schoolId, dto)
  }

  @Delete()
  clearAll(@Request() req: { user: RequestUser }) {
    return this.kbService.clearAllForSchool(req.user.schoolId)
  }
}

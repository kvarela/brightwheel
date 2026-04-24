import { Controller, Get, Query } from '@nestjs/common'
import { SchoolService } from './school.service'

@Controller('schools')
export class SchoolController {
  constructor(private schoolService: SchoolService) {}

  @Get('search')
  search(@Query('q') q: string): Promise<{ id: string; name: string }[]> {
    if (!q?.trim()) return Promise.resolve([])
    return this.schoolService.search(q.trim())
  }
}

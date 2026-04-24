import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { SchoolService } from './school.service'
import { School } from './entities/school.entity'

@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get()
  async list(
    @Query('search') search?: string,
  ): Promise<Array<Pick<School, 'id' | 'name' | 'slug'>>> {
    const schools = await this.schoolService.findAllActive(search?.trim() || undefined)
    return schools.map(({ id, name, slug }) => ({ id, name, slug }))
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Pick<School, 'id' | 'name' | 'slug'>> {
    const { id: schoolId, name, slug } = await this.schoolService.findById(id)
    return { id: schoolId, name, slug }
  }
}

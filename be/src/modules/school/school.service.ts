import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { School } from './entities/school.entity'

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async findAllActive(): Promise<School[]> {
    return this.schoolRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    })
  }

  async findById(id: string): Promise<School> {
    const school = await this.schoolRepository.findOne({ where: { id } })
    if (!school) {
      throw new NotFoundException(`School ${id} not found`)
    }
    return school
  }
}

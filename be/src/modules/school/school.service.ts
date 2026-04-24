import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { School } from './entities/school.entity'

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async findAllActive(search?: string): Promise<School[]> {
    return this.schoolRepository.find({
      where: search
        ? [
            { isActive: true, name: ILike(`%${search}%`) },
            { isActive: true, slug: ILike(`%${search}%`) },
          ]
        : { isActive: true },
      order: { name: 'ASC' },
      take: 50,
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

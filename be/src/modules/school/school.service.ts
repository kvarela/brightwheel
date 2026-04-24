import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { School } from './entities/school.entity'

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  async search(q: string): Promise<{ id: string; name: string }[]> {
    const schools = await this.schoolRepository.find({
      where: { name: ILike(`%${q}%`) },
      order: { name: 'ASC' },
      take: 10,
    })
    return schools.map((s) => ({ id: s.id, name: s.name }))
  }
}

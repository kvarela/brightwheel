import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HandbookUpload } from './entities/handbook-upload.entity'

@Injectable()
export class HandbookService {
  constructor(
    @InjectRepository(HandbookUpload)
    private readonly handbookUploadRepo: Repository<HandbookUpload>,
  ) {}

  findBySchool(schoolId: string): Promise<HandbookUpload[]> {
    return this.handbookUploadRepo.find({
      where: { schoolId },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    })
  }
}

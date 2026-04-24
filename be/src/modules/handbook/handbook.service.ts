import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { HandbookUploadStatus } from '@brightwheel/shared'
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

  async deleteUpload(uploadId: string, schoolId: string): Promise<void> {
    const upload = await this.handbookUploadRepo.findOne({
      where: { id: uploadId, schoolId },
    })
    if (!upload) {
      throw new NotFoundException(`Handbook upload ${uploadId} not found`)
    }
    if (upload.status === HandbookUploadStatus.Completed) {
      throw new BadRequestException('Completed handbook uploads cannot be deleted')
    }
    await this.handbookUploadRepo.remove(upload)
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ExtractedInquiryDto,
  HandbookUploadDetailDto,
  HandbookUploadStatus,
} from '@brightwheel/shared'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'

@Injectable()
export class HandbookService {
  constructor(
    @InjectRepository(HandbookUpload)
    private readonly handbookUploadRepo: Repository<HandbookUpload>,
    @InjectRepository(HandbookVersion)
    private readonly handbookVersionRepo: Repository<HandbookVersion>,
    @InjectRepository(HandbookDiffEntry)
    private readonly handbookDiffRepo: Repository<HandbookDiffEntry>,
  ) {}

  findBySchool(schoolId: string): Promise<HandbookUpload[]> {
    return this.handbookUploadRepo.find({
      where: { schoolId },
      relations: { uploadedBy: true },
      order: { createdAt: 'DESC' },
    })
  }

  async findUploadDetail(
    schoolId: string,
    uploadId: string,
  ): Promise<HandbookUploadDetailDto> {
    const upload = await this.handbookUploadRepo.findOne({
      where: { id: uploadId, schoolId },
      relations: { uploadedBy: true },
    })
    if (!upload) {
      throw new NotFoundException(`Handbook upload ${uploadId} not found`)
    }

    const version = await this.handbookVersionRepo.findOne({
      where: { uploadId: upload.id },
    })

    const inquiries: ExtractedInquiryDto[] = version
      ? (
          await this.handbookDiffRepo.find({
            where: { handbookVersionId: version.id },
            order: { createdAt: 'ASC' },
          })
        ).map((diff) => ({
          question: diff.proposedQuestion,
          answer: diff.proposedAnswer,
          sourceExcerpt: diff.sourceExcerpt,
          confidence: diff.extractionConfidence!,
        }))
      : []

    return {
      id: upload.id,
      fileName: upload.fileName,
      fileType: upload.fileType,
      status: upload.status,
      errorMessage: upload.errorMessage,
      createdAt: upload.createdAt.toISOString(),
      uploadedBy: {
        id: upload.uploadedBy.id,
        fullName: upload.uploadedBy.fullName,
        email: upload.uploadedBy.email,
      },
      inquiries,
    }
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

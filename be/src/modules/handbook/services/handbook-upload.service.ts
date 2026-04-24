import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ExtractedInquiryDto,
  HandbookDiffChangeType,
  HandbookDiffStatus,
  HandbookFileType,
  HandbookProcessResponseDto,
  HandbookSignedUploadRequestDto,
  HandbookSignedUploadResponseDto,
  HandbookUploadStatus,
  HandbookVersionStatus,
  KnowledgeBaseSource,
} from '@brightwheel/shared'
import { HandbookUpload } from '../entities/handbook-upload.entity'
import { HandbookVersion } from '../entities/handbook-version.entity'
import { HandbookDiffEntry } from '../entities/handbook-diff-entry.entity'
import { KnowledgeBaseEntry } from '../../knowledge-base/entities/knowledge-base-entry.entity'
import { ObjectStorageService } from './object-storage.service'
import { HandbookTextExtractorService } from './handbook-text-extractor.service'
import { HandbookParserService } from './handbook-parser.service'

const ALLOWED_CONTENT_TYPES: Record<HandbookFileType, string[]> = {
  [HandbookFileType.Pdf]: ['application/pdf'],
  [HandbookFileType.Docx]: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [HandbookFileType.Txt]: ['text/plain'],
}

@Injectable()
export class HandbookUploadService {
  private readonly logger = new Logger(HandbookUploadService.name)

  constructor(
    @InjectRepository(HandbookUpload)
    private readonly uploadRepository: Repository<HandbookUpload>,
    @InjectRepository(HandbookVersion)
    private readonly versionRepository: Repository<HandbookVersion>,
    @InjectRepository(HandbookDiffEntry)
    private readonly diffRepository: Repository<HandbookDiffEntry>,
    @InjectRepository(KnowledgeBaseEntry)
    private readonly knowledgeBaseRepository: Repository<KnowledgeBaseEntry>,
    private readonly storageService: ObjectStorageService,
    private readonly textExtractor: HandbookTextExtractorService,
    private readonly parserService: HandbookParserService,
  ) {}

  async createSignedUpload(
    schoolId: string,
    uploadedById: string,
    request: HandbookSignedUploadRequestDto,
  ): Promise<HandbookSignedUploadResponseDto> {
    this.assertValidContentType(request.fileType, request.contentType)

    const upload = await this.uploadRepository.save(
      this.uploadRepository.create({
        schoolId,
        uploadedById,
        fileName: request.fileName,
        fileType: request.fileType,
        fileKey: '',
        status: HandbookUploadStatus.Pending,
      }),
    )

    const fileKey = this.storageService.buildHandbookFileKey(
      schoolId,
      upload.id,
      request.fileName,
    )
    upload.fileKey = fileKey
    await this.uploadRepository.save(upload)

    const { uploadUrl, expiresInSeconds } = await this.storageService.createSignedUploadUrl(
      fileKey,
      request.contentType,
    )

    return {
      uploadId: upload.id,
      fileKey,
      uploadUrl,
      expiresInSeconds,
    }
  }

  async processUpload(uploadId: string): Promise<HandbookProcessResponseDto> {
    const upload = await this.uploadRepository.findOne({ where: { id: uploadId } })
    if (!upload) {
      throw new NotFoundException(`Handbook upload ${uploadId} not found`)
    }
    if (upload.status === HandbookUploadStatus.Completed) {
      const existingVersion = await this.versionRepository.findOne({
        where: { uploadId: upload.id },
      })
      const inquiries = existingVersion
        ? await this.listExtractedInquiriesFromDiffs(existingVersion.id)
        : []
      return {
        uploadId: upload.id,
        versionId: existingVersion?.id ?? '',
        status: upload.status,
        inquiriesExtracted: inquiries.length,
        inquiries,
      }
    }

    upload.status = HandbookUploadStatus.Processing
    upload.errorMessage = null
    await this.uploadRepository.save(upload)

    try {
      const buffer = await this.storageService.downloadObject(upload.fileKey)
      const text = await this.textExtractor.extractText(buffer, upload.fileType)
      if (!text || text.length < 40) {
        throw new BadRequestException(
          'Handbook text is too short to extract meaningful inquiries',
        )
      }

      const inquiries = await this.parserService.extractInquiries(text)
      const version = await this.createHandbookVersion(upload)
      await this.persistInquiries(upload.schoolId, version.id, inquiries)

      upload.status = HandbookUploadStatus.Completed
      await this.uploadRepository.save(upload)

      return {
        uploadId: upload.id,
        versionId: version.id,
        status: HandbookUploadStatus.Completed,
        inquiriesExtracted: inquiries.length,
        inquiries,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.error(`Handbook processing failed for upload ${upload.id}: ${message}`)
      upload.status = HandbookUploadStatus.Failed
      upload.errorMessage = message
      await this.uploadRepository.save(upload)
      throw error
    }
  }

  private async createHandbookVersion(upload: HandbookUpload): Promise<HandbookVersion> {
    const latest = await this.versionRepository
      .createQueryBuilder('version')
      .where('version.schoolId = :schoolId', { schoolId: upload.schoolId })
      .orderBy('version.versionNumber', 'DESC')
      .getOne()
    const versionNumber = latest ? latest.versionNumber + 1 : 1

    return this.versionRepository.save(
      this.versionRepository.create({
        schoolId: upload.schoolId,
        uploadId: upload.id,
        versionNumber,
        status: HandbookVersionStatus.PendingReview,
      }),
    )
  }

  private async persistInquiries(
    schoolId: string,
    handbookVersionId: string,
    inquiries: ExtractedInquiryDto[],
  ): Promise<void> {
    if (inquiries.length === 0) return

    const kbEntries = inquiries.map((inquiry) =>
      this.knowledgeBaseRepository.create({
        schoolId,
        question: inquiry.question,
        answer: inquiry.answer,
        source: KnowledgeBaseSource.HandbookExtraction,
        handbookVersionId,
        isActive: true,
      }),
    )
    const savedEntries = await this.knowledgeBaseRepository.save(kbEntries)

    const diffEntries = savedEntries.map((entry, index) =>
      this.diffRepository.create({
        handbookVersionId,
        knowledgeBaseEntryId: entry.id,
        changeType: HandbookDiffChangeType.Add,
        proposedQuestion: entry.question,
        proposedAnswer: entry.answer,
        sourceExcerpt: inquiries[index].sourceExcerpt,
        extractionConfidence: inquiries[index].confidence,
        status: HandbookDiffStatus.Pending,
      }),
    )
    await this.diffRepository.save(diffEntries)
  }

  private async listExtractedInquiriesFromDiffs(
    handbookVersionId: string,
  ): Promise<ExtractedInquiryDto[]> {
    const diffs = await this.diffRepository.find({
      where: { handbookVersionId },
      order: { createdAt: 'ASC' },
    })
    return diffs.map((diff) => ({
      question: diff.proposedQuestion,
      answer: diff.proposedAnswer,
      sourceExcerpt: diff.sourceExcerpt,
      confidence: diff.extractionConfidence!,
    }))
  }

  private assertValidContentType(fileType: HandbookFileType, contentType: string) {
    const allowed = ALLOWED_CONTENT_TYPES[fileType]
    if (!allowed || !allowed.includes(contentType)) {
      throw new BadRequestException(
        `Content type "${contentType}" is not valid for file type ${fileType}`,
      )
    }
  }
}

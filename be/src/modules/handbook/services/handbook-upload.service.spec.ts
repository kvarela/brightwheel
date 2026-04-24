import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import {
  ExtractedInquiryDto,
  ExtractionConfidence,
  HandbookFileType,
  HandbookUploadStatus,
  KnowledgeBaseSource,
} from '@brightwheel/shared'
import { getDatabaseConfig } from '../../../config/database.config'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'
import { HandbookUpload } from '../entities/handbook-upload.entity'
import { HandbookVersion } from '../entities/handbook-version.entity'
import { HandbookDiffEntry } from '../entities/handbook-diff-entry.entity'
import { KnowledgeBaseEntry } from '../../knowledge-base/entities/knowledge-base-entry.entity'
import { HandbookUploadService } from './handbook-upload.service'
import { HandbookRequestContextService } from './handbook-request-context.service'
import { ObjectStorageService } from './object-storage.service'
import { HandbookTextExtractorService } from './handbook-text-extractor.service'
import { HandbookParserService } from './handbook-parser.service'
import {
  createTestSchool,
  createTestStaffUser,
} from '../../../../test/helpers/factories'

function makeInquiry(overrides: Partial<ExtractedInquiryDto> = {}): ExtractedInquiryDto {
  return {
    question: overrides.question ?? 'What time does pickup end?',
    answer: overrides.answer ?? 'Pickup ends at 6pm.',
    sourceExcerpt: overrides.sourceExcerpt ?? 'Pickup: 3:00 PM – 6:00 PM',
    confidence: overrides.confidence ?? ExtractionConfidence.High,
  }
}

describe('HandbookUploadService', () => {
  let db: DataSource
  let uploadService: HandbookUploadService
  let storageService: jest.Mocked<ObjectStorageService>
  let extractorService: jest.Mocked<HandbookTextExtractorService>
  let parserService: jest.Mocked<HandbookParserService>
  let school: School
  let staff: StaffUser

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL_TEST =
      process.env.DATABASE_URL_TEST ??
      'postgresql://bw:bw@localhost:5432/brightwheel_test'

    storageService = {
      createSignedUploadUrl: jest.fn(),
      downloadObject: jest.fn(),
      createSignedDownloadUrl: jest.fn(),
      buildHandbookFileKey: jest.fn(
        (schoolId: string, uploadId: string, fileName: string) =>
          `schools/${schoolId}/handbooks/${uploadId}/${fileName}`,
      ),
    } as unknown as jest.Mocked<ObjectStorageService>

    extractorService = {
      extractText: jest.fn(),
    } as unknown as jest.Mocked<HandbookTextExtractorService>

    parserService = {
      extractInquiries: jest.fn(),
    } as unknown as jest.Mocked<HandbookParserService>

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(getDatabaseConfig()),
        TypeOrmModule.forFeature([
          School,
          StaffUser,
          HandbookUpload,
          HandbookVersion,
          HandbookDiffEntry,
          KnowledgeBaseEntry,
        ]),
      ],
      providers: [
        HandbookUploadService,
        HandbookRequestContextService,
        { provide: ObjectStorageService, useValue: storageService },
        { provide: HandbookTextExtractorService, useValue: extractorService },
        { provide: HandbookParserService, useValue: parserService },
      ],
    }).compile()

    db = moduleRef.get<DataSource>(getDataSourceToken())
    uploadService = moduleRef.get(HandbookUploadService)
  })

  beforeEach(async () => {
    for (const entity of db.entityMetadatas) {
      await db.getRepository(entity.name).query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
    }
    school = await createTestSchool(db)
    staff = await createTestStaffUser(db, school.id)
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.destroy()
  })

  describe('createSignedUpload', () => {
    it('creates a pending upload row and returns a signed URL', async () => {
      storageService.createSignedUploadUrl.mockResolvedValue({
        uploadUrl: 'https://example.com/signed',
        expiresInSeconds: 900,
      })

      const result = await uploadService.createSignedUpload(school.id, staff.id, {
        fileName: 'handbook.pdf',
        fileType: HandbookFileType.Pdf,
        contentType: 'application/pdf',
      })

      expect(result.uploadUrl).toBe('https://example.com/signed')
      expect(result.expiresInSeconds).toBe(900)
      expect(result.fileKey).toContain('schools/')
      expect(result.fileKey).toContain('handbook.pdf')

      const stored = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: result.uploadId } })
      expect(stored.status).toBe(HandbookUploadStatus.Pending)
      expect(stored.schoolId).toBe(school.id)
      expect(stored.uploadedById).toBe(staff.id)
      expect(stored.fileKey).toBe(result.fileKey)
    })

    it('rejects a content type that does not match the file type', async () => {
      await expect(
        uploadService.createSignedUpload(school.id, staff.id, {
          fileName: 'handbook.pdf',
          fileType: HandbookFileType.Pdf,
          contentType: 'text/html',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('processUpload', () => {
    async function seedPendingUpload(): Promise<HandbookUpload> {
      return db.getRepository(HandbookUpload).save(
        db.getRepository(HandbookUpload).create({
          schoolId: school.id,
          uploadedById: staff.id,
          fileName: 'handbook.pdf',
          fileType: HandbookFileType.Pdf,
          fileKey: 'schools/x/handbooks/y/handbook.pdf',
          status: HandbookUploadStatus.Pending,
        }),
      )
    }

    it('parses the handbook, writes KB entries, and marks the upload complete', async () => {
      const upload = await seedPendingUpload()
      storageService.downloadObject.mockResolvedValue(Buffer.from('handbook bytes'))
      extractorService.extractText.mockResolvedValue(
        'Welcome to our school. We are open from 7am to 6pm, Monday through Friday.',
      )
      const inquiries = [
        makeInquiry({ question: 'Q1', answer: 'A1' }),
        makeInquiry({
          question: 'Q2',
          answer: 'A2',
          confidence: ExtractionConfidence.Medium,
        }),
      ]
      parserService.extractInquiries.mockResolvedValue(inquiries)

      const result = await uploadService.processUpload(upload.id)

      expect(result.status).toBe(HandbookUploadStatus.Completed)
      expect(result.inquiriesExtracted).toBe(2)
      expect(result.inquiries).toEqual(inquiries)

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.status).toBe(HandbookUploadStatus.Completed)
      expect(reloaded.errorMessage).toBeNull()

      const kbEntries = await db
        .getRepository(KnowledgeBaseEntry)
        .find({ where: { schoolId: school.id } })
      expect(kbEntries).toHaveLength(2)
      expect(kbEntries.every((e) => e.source === KnowledgeBaseSource.HandbookExtraction)).toBe(
        true,
      )
      expect(kbEntries.every((e) => e.handbookVersionId === result.versionId)).toBe(true)

      const diffs = await db
        .getRepository(HandbookDiffEntry)
        .find({ where: { handbookVersionId: result.versionId } })
      expect(diffs).toHaveLength(2)

      const version = await db
        .getRepository(HandbookVersion)
        .findOneOrFail({ where: { id: result.versionId } })
      expect(version.versionNumber).toBe(1)
    })

    it('increments the version number for subsequent uploads within a school', async () => {
      const first = await seedPendingUpload()
      storageService.downloadObject.mockResolvedValue(Buffer.from('a'))
      extractorService.extractText.mockResolvedValue(
        'First handbook text content that is long enough to parse.',
      )
      parserService.extractInquiries.mockResolvedValue([makeInquiry()])
      await uploadService.processUpload(first.id)

      const second = await seedPendingUpload()
      extractorService.extractText.mockResolvedValue(
        'Second handbook text content that is long enough to parse.',
      )
      parserService.extractInquiries.mockResolvedValue([makeInquiry({ question: 'Q2' })])
      const result = await uploadService.processUpload(second.id)

      const version = await db
        .getRepository(HandbookVersion)
        .findOneOrFail({ where: { id: result.versionId } })
      expect(version.versionNumber).toBe(2)
    })

    it('marks the upload as failed and rethrows when parsing blows up', async () => {
      const upload = await seedPendingUpload()
      storageService.downloadObject.mockResolvedValue(Buffer.from('bytes'))
      extractorService.extractText.mockResolvedValue(
        'Handbook text that is long enough to trigger parsing.',
      )
      parserService.extractInquiries.mockRejectedValue(new Error('Claude offline'))

      await expect(uploadService.processUpload(upload.id)).rejects.toThrow('Claude offline')

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.status).toBe(HandbookUploadStatus.Failed)
      expect(reloaded.errorMessage).toBe('Claude offline')

      const kbEntries = await db
        .getRepository(KnowledgeBaseEntry)
        .find({ where: { schoolId: school.id } })
      expect(kbEntries).toHaveLength(0)
    })

    it('rejects when the extracted text is too short to parse', async () => {
      const upload = await seedPendingUpload()
      storageService.downloadObject.mockResolvedValue(Buffer.from('x'))
      extractorService.extractText.mockResolvedValue('tiny')

      await expect(uploadService.processUpload(upload.id)).rejects.toThrow(BadRequestException)

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.status).toBe(HandbookUploadStatus.Failed)
    })

    it('is idempotent for an already-completed upload', async () => {
      const upload = await seedPendingUpload()
      storageService.downloadObject.mockResolvedValue(Buffer.from('a'))
      extractorService.extractText.mockResolvedValue(
        'Handbook text that is long enough to parse.',
      )
      parserService.extractInquiries.mockResolvedValue([makeInquiry()])
      await uploadService.processUpload(upload.id)

      const extractorCallCount = extractorService.extractText.mock.calls.length
      const parserCallCount = parserService.extractInquiries.mock.calls.length

      const second = await uploadService.processUpload(upload.id)
      expect(second.status).toBe(HandbookUploadStatus.Completed)
      expect(second.inquiriesExtracted).toBe(1)
      expect(extractorService.extractText.mock.calls.length).toBe(extractorCallCount)
      expect(parserService.extractInquiries.mock.calls.length).toBe(parserCallCount)
    })

    it('throws when the upload does not exist', async () => {
      await expect(
        uploadService.processUpload('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException)
    })
  })

})

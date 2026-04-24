import 'reflect-metadata'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import {
  ExtractionConfidence,
  HandbookDiffChangeType,
  HandbookDiffStatus,
  HandbookFileType,
  HandbookUploadStatus,
  HandbookVersionStatus,
  KnowledgeBaseSource,
} from '@brightwheel/shared'
import { getDatabaseConfig } from '../../config/database.config'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { KnowledgeBaseEntry } from '../knowledge-base/entities/knowledge-base-entry.entity'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'
import { HandbookService } from './handbook.service'
import { createTestSchool, createTestStaffUser } from '../../../test/helpers/factories'

describe('HandbookService', () => {
  let db: DataSource
  let service: HandbookService
  let school: School
  let otherSchool: School
  let staff: StaffUser

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL_TEST =
      process.env.DATABASE_URL_TEST ??
      'postgresql://bw:bw@localhost:5432/brightwheel_test'

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
      providers: [HandbookService],
    }).compile()

    db = moduleRef.get<DataSource>(getDataSourceToken())
    service = moduleRef.get(HandbookService)
  })

  beforeEach(async () => {
    for (const entity of db.entityMetadatas) {
      await db.getRepository(entity.name).query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
    }
    school = await createTestSchool(db)
    otherSchool = await createTestSchool(db)
    staff = await createTestStaffUser(db, school.id)
  })

  afterAll(async () => {
    await db.destroy()
  })

  async function seedUpload(
    overrides: Partial<HandbookUpload> = {},
  ): Promise<HandbookUpload> {
    const repo = db.getRepository(HandbookUpload)
    return repo.save(
      repo.create({
        schoolId: overrides.schoolId ?? school.id,
        uploadedById: overrides.uploadedById ?? staff.id,
        fileName: overrides.fileName ?? 'handbook.pdf',
        fileType: overrides.fileType ?? HandbookFileType.Pdf,
        fileKey: overrides.fileKey ?? 'schools/x/handbooks/y/handbook.pdf',
        status: overrides.status ?? HandbookUploadStatus.Pending,
      }),
    )
  }

  async function seedVersionWithDiffs(
    upload: HandbookUpload,
    inquiries: Array<{
      question: string
      answer: string
      sourceExcerpt: string | null
      confidence: ExtractionConfidence
    }>,
  ): Promise<HandbookVersion> {
    const versionRepo = db.getRepository(HandbookVersion)
    const version = await versionRepo.save(
      versionRepo.create({
        schoolId: upload.schoolId,
        uploadId: upload.id,
        versionNumber: 1,
        status: HandbookVersionStatus.PendingReview,
      }),
    )

    const kbRepo = db.getRepository(KnowledgeBaseEntry)
    const kbEntries = await kbRepo.save(
      inquiries.map((i) =>
        kbRepo.create({
          schoolId: upload.schoolId,
          question: i.question,
          answer: i.answer,
          source: KnowledgeBaseSource.HandbookExtraction,
          handbookVersionId: version.id,
          isActive: true,
        }),
      ),
    )

    const diffRepo = db.getRepository(HandbookDiffEntry)
    await diffRepo.save(
      inquiries.map((i, idx) =>
        diffRepo.create({
          handbookVersionId: version.id,
          knowledgeBaseEntryId: kbEntries[idx].id,
          changeType: HandbookDiffChangeType.Add,
          proposedQuestion: i.question,
          proposedAnswer: i.answer,
          sourceExcerpt: i.sourceExcerpt,
          extractionConfidence: i.confidence,
          status: HandbookDiffStatus.Pending,
        }),
      ),
    )

    return version
  }

  describe('findBySchool', () => {
    it('returns uploads for the school ordered by createdAt DESC', async () => {
      const older = await seedUpload({ fileName: 'older.pdf' })
      // Force a deterministic ordering gap.
      await db
        .getRepository(HandbookUpload)
        .update(older.id, { createdAt: new Date(Date.now() - 60_000) })
      const newer = await seedUpload({ fileName: 'newer.pdf' })

      const result = await service.findBySchool(school.id)

      expect(result.map((u) => u.id)).toEqual([newer.id, older.id])
      expect(result[0].uploadedBy.id).toBe(staff.id)
    })

    it('scopes results to the requested school', async () => {
      await seedUpload()
      const result = await service.findBySchool(otherSchool.id)
      expect(result).toEqual([])
    })

    it('returns empty array when no uploads exist', async () => {
      const result = await service.findBySchool(school.id)
      expect(result).toEqual([])
    })
  })

  describe('findUploadDetail', () => {
    it('returns upload detail with extracted inquiries in insertion order', async () => {
      const upload = await seedUpload({ status: HandbookUploadStatus.Completed })
      await seedVersionWithDiffs(upload, [
        {
          question: 'Q1',
          answer: 'A1',
          sourceExcerpt: 'excerpt 1',
          confidence: ExtractionConfidence.High,
        },
        {
          question: 'Q2',
          answer: 'A2',
          sourceExcerpt: null,
          confidence: ExtractionConfidence.Medium,
        },
      ])

      const result = await service.findUploadDetail(school.id, upload.id)

      expect(result.id).toBe(upload.id)
      expect(result.fileName).toBe(upload.fileName)
      expect(result.status).toBe(HandbookUploadStatus.Completed)
      expect(result.uploadedBy).toEqual({
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
      })
      expect(result.inquiries).toEqual([
        {
          question: 'Q1',
          answer: 'A1',
          sourceExcerpt: 'excerpt 1',
          confidence: ExtractionConfidence.High,
        },
        {
          question: 'Q2',
          answer: 'A2',
          sourceExcerpt: null,
          confidence: ExtractionConfidence.Medium,
        },
      ])
    })

    it('returns empty inquiries when no version exists yet', async () => {
      const upload = await seedUpload({ status: HandbookUploadStatus.Pending })

      const result = await service.findUploadDetail(school.id, upload.id)

      expect(result.status).toBe(HandbookUploadStatus.Pending)
      expect(result.inquiries).toEqual([])
    })

    it('throws NotFoundException when upload belongs to a different school', async () => {
      const upload = await seedUpload()

      await expect(
        service.findUploadDetail(otherSchool.id, upload.id),
      ).rejects.toThrow(NotFoundException)
    })

    it('throws NotFoundException when the upload does not exist', async () => {
      await expect(
        service.findUploadDetail(school.id, '00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteUpload', () => {
    it.each([
      HandbookUploadStatus.Pending,
      HandbookUploadStatus.Processing,
      HandbookUploadStatus.Failed,
    ])('removes an upload in status %s', async (status) => {
      const upload = await seedUpload({ status })

      await service.deleteUpload(upload.id, school.id)

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOne({ where: { id: upload.id } })
      expect(reloaded).toBeNull()
    })

    it('throws NotFoundException when the upload belongs to a different school', async () => {
      const upload = await seedUpload()

      await expect(service.deleteUpload(upload.id, otherSchool.id)).rejects.toThrow(
        NotFoundException,
      )

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.id).toBe(upload.id)
    })

    it('throws NotFoundException when the upload does not exist', async () => {
      await expect(
        service.deleteUpload('00000000-0000-0000-0000-000000000000', school.id),
      ).rejects.toThrow(NotFoundException)
    })

    it('throws BadRequestException when the upload is completed', async () => {
      const upload = await seedUpload({ status: HandbookUploadStatus.Completed })

      await expect(service.deleteUpload(upload.id, school.id)).rejects.toThrow(
        BadRequestException,
      )

      const reloaded = await db
        .getRepository(HandbookUpload)
        .findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.status).toBe(HandbookUploadStatus.Completed)
    })
  })
})

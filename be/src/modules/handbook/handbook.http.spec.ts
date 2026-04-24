import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import {
  ExtractionConfidence,
  HandbookDiffChangeType,
  HandbookDiffStatus,
  HandbookFileType,
  HandbookUploadStatus,
  HandbookVersionStatus,
  KnowledgeBaseSource,
} from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { createTestSchool, createTestStaffUser } from '../../../test/helpers/factories'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { KnowledgeBaseEntry } from '../knowledge-base/entities/knowledge-base-entry.entity'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'

describe('HandbookController (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let jwtService: JwtService
  let uploadRepo: Repository<HandbookUpload>
  let versionRepo: Repository<HandbookVersion>
  let diffRepo: Repository<HandbookDiffEntry>
  let kbRepo: Repository<KnowledgeBaseEntry>
  let school: School
  let otherSchool: School
  let staff: StaffUser
  let token: string

  function signTokenFor(user: StaffUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      schoolId: user.schoolId,
      role: user.role,
    }
    return jwtService.sign(payload)
  }

  async function seedUpload(
    overrides: Partial<HandbookUpload> = {},
  ): Promise<HandbookUpload> {
    return uploadRepo.save(
      uploadRepo.create({
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
    const version = await versionRepo.save(
      versionRepo.create({
        schoolId: upload.schoolId,
        uploadId: upload.id,
        versionNumber: 1,
        status: HandbookVersionStatus.PendingReview,
      }),
    )
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

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    jwtService = app.get(JwtService)
    uploadRepo = app.get(getRepositoryToken(HandbookUpload))
    versionRepo = app.get(getRepositoryToken(HandbookVersion))
    diffRepo = app.get(getRepositoryToken(HandbookDiffEntry))
    kbRepo = app.get(getRepositoryToken(KnowledgeBaseEntry))
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
    school = await createTestSchool(db)
    otherSchool = await createTestSchool(db)
    staff = await createTestStaffUser(db, school.id)
    token = signTokenFor(staff)
  })

  describe('GET /api/handbook', () => {
    it('returns uploads for the authenticated staff user\'s school, newest first', async () => {
      const older = await seedUpload({ fileName: 'older.pdf' })
      await uploadRepo.update(older.id, { createdAt: new Date(Date.now() - 60_000) })
      const newer = await seedUpload({ fileName: 'newer.pdf' })
      await seedUpload({ schoolId: otherSchool.id, fileName: 'other-school.pdf' })

      const response = await request(app.getHttpServer())
        .get('/api/handbook')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.map((u: { id: string }) => u.id)).toEqual([newer.id, older.id])
    })

    it('returns 401 without a JWT', async () => {
      await request(app.getHttpServer()).get('/api/handbook').expect(401)
    })
  })

  describe('GET /api/handbook/uploads/:uploadId', () => {
    it('returns upload detail with extracted inquiries', async () => {
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

      const response = await request(app.getHttpServer())
        .get(`/api/handbook/uploads/${upload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: upload.id,
        fileName: upload.fileName,
        status: HandbookUploadStatus.Completed,
        uploadedBy: {
          id: staff.id,
          fullName: staff.fullName,
          email: staff.email,
        },
        inquiries: [
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
        ],
      })
    })

    it('returns empty inquiries for a pending upload', async () => {
      const upload = await seedUpload({ status: HandbookUploadStatus.Pending })

      const response = await request(app.getHttpServer())
        .get(`/api/handbook/uploads/${upload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.inquiries).toEqual([])
      expect(response.body.status).toBe(HandbookUploadStatus.Pending)
    })

    it('returns 404 when the upload belongs to another school', async () => {
      const upload = await seedUpload({ schoolId: otherSchool.id })

      await request(app.getHttpServer())
        .get(`/api/handbook/uploads/${upload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })

    it('returns 401 without a JWT', async () => {
      const upload = await seedUpload()
      await request(app.getHttpServer())
        .get(`/api/handbook/uploads/${upload.id}`)
        .expect(401)
    })

    it('returns 400 when the id is not a UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/handbook/uploads/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  describe('DELETE /api/handbook/:uploadId', () => {
    it.each([
      HandbookUploadStatus.Pending,
      HandbookUploadStatus.Processing,
      HandbookUploadStatus.Failed,
    ])('deletes an upload in status %s', async (status) => {
      const upload = await seedUpload({ status })

      await request(app.getHttpServer())
        .delete(`/api/handbook/${upload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const reloaded = await uploadRepo.findOne({ where: { id: upload.id } })
      expect(reloaded).toBeNull()
    })

    it('returns 400 when the upload is completed', async () => {
      const upload = await seedUpload({ status: HandbookUploadStatus.Completed })

      await request(app.getHttpServer())
        .delete(`/api/handbook/${upload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const reloaded = await uploadRepo.findOneOrFail({ where: { id: upload.id } })
      expect(reloaded.status).toBe(HandbookUploadStatus.Completed)
    })

    it('returns 404 when the upload belongs to a different school', async () => {
      const otherStaff = await createTestStaffUser(db, otherSchool.id)
      const otherToken = signTokenFor(otherStaff)
      const upload = await seedUpload()

      await request(app.getHttpServer())
        .delete(`/api/handbook/${upload.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404)

      await uploadRepo.findOneOrFail({ where: { id: upload.id } })
    })

    it('returns 401 without a JWT', async () => {
      const upload = await seedUpload()
      await request(app.getHttpServer())
        .delete(`/api/handbook/${upload.id}`)
        .expect(401)
    })

    it('returns 400 when the id is not a UUID', async () => {
      await request(app.getHttpServer())
        .delete('/api/handbook/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })
})

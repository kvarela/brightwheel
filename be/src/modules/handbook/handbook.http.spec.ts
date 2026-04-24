import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import { HandbookFileType, HandbookUploadStatus } from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { createTestSchool, createTestStaffUser } from '../../../test/helpers/factories'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { HandbookUpload } from './entities/handbook-upload.entity'

describe('HandbookController DELETE (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let jwtService: JwtService
  let uploadRepo: Repository<HandbookUpload>
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

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    jwtService = app.get(JwtService)
    uploadRepo = app.get(getRepositoryToken(HandbookUpload))
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

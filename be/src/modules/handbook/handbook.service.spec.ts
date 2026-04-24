import 'reflect-metadata'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { HandbookFileType, HandbookUploadStatus } from '@brightwheel/shared'
import { getDatabaseConfig } from '../../config/database.config'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { HandbookUpload } from './entities/handbook-upload.entity'
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
        TypeOrmModule.forFeature([School, StaffUser, HandbookUpload]),
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

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { getDatabaseConfig } from '../../../config/database.config'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'
import { HandbookRequestContextService } from './handbook-request-context.service'
import {
  createTestSchool,
  createTestStaffUser,
} from '../../../../test/helpers/factories'

describe('HandbookRequestContextService', () => {
  let db: DataSource
  let service: HandbookRequestContextService

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL_TEST =
      process.env.DATABASE_URL_TEST ??
      'postgresql://bw:bw@localhost:5432/brightwheel_test'

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(getDatabaseConfig()),
        TypeOrmModule.forFeature([School, StaffUser]),
      ],
      providers: [HandbookRequestContextService],
    }).compile()

    db = moduleRef.get<DataSource>(getDataSourceToken())
    service = moduleRef.get(HandbookRequestContextService)
  })

  beforeEach(async () => {
    for (const entity of db.entityMetadatas) {
      await db.getRepository(entity.name).query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('falls back to the seeded school and provisions a system staff user', async () => {
    const school = await createTestSchool(db)

    const ctx = await service.resolve()
    expect(ctx.schoolId).toBe(school.id)
    expect(ctx.staffUserId).toBeTruthy()

    const staff = await db
      .getRepository(StaffUser)
      .findOneOrFail({ where: { id: ctx.staffUserId } })
    expect(staff.email).toBe('system@brightwheel.local')
    expect(staff.schoolId).toBe(school.id)
  })

  it('reuses the system staff user across calls', async () => {
    await createTestSchool(db)
    const first = await service.resolve()
    const second = await service.resolve()
    expect(first.staffUserId).toBe(second.staffUserId)
  })

  it('uses header values when provided', async () => {
    const school = await createTestSchool(db)
    const staff = await createTestStaffUser(db, school.id)

    const ctx = await service.resolve(school.id, staff.id)
    expect(ctx.schoolId).toBe(school.id)
    expect(ctx.staffUserId).toBe(staff.id)
  })

  it('throws when the supplied school id is unknown', async () => {
    await createTestSchool(db)
    await expect(
      service.resolve('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(NotFoundException)
  })

  it('throws when no schools exist', async () => {
    await expect(service.resolve()).rejects.toThrow(NotFoundException)
  })
})

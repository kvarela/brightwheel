import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import { KnowledgeBaseSource } from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { createTestSchool, createTestStaffUser } from '../../../test/helpers/factories'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'

describe('KnowledgeBaseController (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let jwtService: JwtService
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

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    jwtService = app.get(JwtService)
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

  describe('DELETE /api/knowledge-base', () => {
    it('deletes all entries for the authenticated staff user\'s school', async () => {
      await kbRepo.save([
        {
          schoolId: school.id,
          question: 'Q1',
          answer: 'A1',
          source: KnowledgeBaseSource.Manual,
        },
        {
          schoolId: school.id,
          question: 'Q2',
          answer: 'A2',
          source: KnowledgeBaseSource.HandbookExtraction,
        },
        {
          schoolId: otherSchool.id,
          question: 'Other',
          answer: 'Other',
          source: KnowledgeBaseSource.Manual,
        },
      ])

      const response = await request(app.getHttpServer())
        .delete('/api/knowledge-base')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toEqual({ deletedCount: 2 })
      const remaining = await kbRepo.find({ where: { schoolId: school.id } })
      expect(remaining).toEqual([])
      const otherRemaining = await kbRepo.find({ where: { schoolId: otherSchool.id } })
      expect(otherRemaining).toHaveLength(1)
    })

    it('returns 401 without a JWT', async () => {
      await request(app.getHttpServer()).delete('/api/knowledge-base').expect(401)
    })
  })
})

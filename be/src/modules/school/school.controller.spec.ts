import { INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { School } from './entities/school.entity'

describe('SchoolController (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let repo: Repository<School>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    repo = app.get(getRepositoryToken(School))
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
  })

  describe('GET /api/schools', () => {
    it('returns id, name, and slug for active schools only', async () => {
      await repo.save([
        { name: 'Sunflower Academy', slug: 'sunflower', isActive: true },
        { name: 'Acorn Preschool', slug: 'acorn', isActive: true },
        { name: 'Inactive School', slug: 'inactive', isActive: false },
      ])

      const response = await request(app.getHttpServer()).get('/api/schools').expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toEqual({
        id: expect.any(String),
        name: 'Acorn Preschool',
        slug: 'acorn',
      })
      expect(response.body[1].slug).toBe('sunflower')
      expect(response.body[0]).not.toHaveProperty('escalationThreshold')
    })

    it('returns an empty array when no schools are active', async () => {
      const response = await request(app.getHttpServer()).get('/api/schools').expect(200)
      expect(response.body).toEqual([])
    })
  })

  describe('GET /api/schools/:id', () => {
    it('returns the school when it exists', async () => {
      const saved = await repo.save({
        name: 'Acorn Preschool',
        slug: 'acorn',
        isActive: true,
      })

      const response = await request(app.getHttpServer())
        .get(`/api/schools/${saved.id}`)
        .expect(200)

      expect(response.body).toEqual({ id: saved.id, name: 'Acorn Preschool', slug: 'acorn' })
    })

    it('returns 404 when the school does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/schools/00000000-0000-0000-0000-000000000000')
        .expect(404)
    })

    it('returns 400 when the id is not a UUID', async () => {
      await request(app.getHttpServer()).get('/api/schools/not-a-uuid').expect(400)
    })
  })
})

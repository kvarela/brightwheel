import { INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { SchoolService } from './school.service'
import { School } from './entities/school.entity'

describe('SchoolService', () => {
  let app: INestApplication
  let db: DataSource
  let service: SchoolService
  let repo: Repository<School>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    service = app.get(SchoolService)
    repo = app.get(getRepositoryToken(School))
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
  })

  describe('findAllActive', () => {
    it('returns only active schools, sorted by name ascending', async () => {
      await repo.save([
        { name: 'Sunflower Academy', slug: 'sunflower', isActive: true },
        { name: 'Acorn Preschool', slug: 'acorn', isActive: true },
        { name: 'Inactive School', slug: 'inactive', isActive: false },
      ])

      const result = await service.findAllActive()

      expect(result.map((s) => s.slug)).toEqual(['acorn', 'sunflower'])
    })

    it('returns an empty array when no schools are active', async () => {
      await repo.save({ name: 'Hidden', slug: 'hidden', isActive: false })

      const result = await service.findAllActive()

      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('returns the school when it exists', async () => {
      const saved = await repo.save({
        name: 'Acorn Preschool',
        slug: 'acorn',
        isActive: true,
      })

      const result = await service.findById(saved.id)

      expect(result.id).toBe(saved.id)
      expect(result.slug).toBe('acorn')
    })

    it('throws NotFoundException when the school does not exist', async () => {
      await expect(
        service.findById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow('not found')
    })
  })
})

import { INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { KnowledgeBaseSource } from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { School } from '../school/entities/school.entity'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { KnowledgeBaseService } from './knowledge-base.service'

describe('KnowledgeBaseService', () => {
  let app: INestApplication
  let db: DataSource
  let service: KnowledgeBaseService
  let schoolRepo: Repository<School>
  let kbRepo: Repository<KnowledgeBaseEntry>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    service = app.get(KnowledgeBaseService)
    schoolRepo = app.get(getRepositoryToken(School))
    kbRepo = app.get(getRepositoryToken(KnowledgeBaseEntry))
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
  })

  describe('search (text fallback, no embedding)', () => {
    it('returns entries matching query tokens sorted by similarity', async () => {
      const school = await schoolRepo.save({
        name: 'Acme',
        slug: 'acme',
        isActive: true,
      })
      await kbRepo.save([
        {
          schoolId: school.id,
          question: 'What are your operating hours?',
          answer: 'We are open Monday through Friday from 7am to 6pm.',
          source: KnowledgeBaseSource.Manual,
        },
        {
          schoolId: school.id,
          question: 'How much is tuition?',
          answer: 'Tuition is $1500 per month for toddlers.',
          source: KnowledgeBaseSource.Manual,
        },
      ])

      const results = await service.search(school.id, 'what are your hours', null)

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].entry.question.toLowerCase()).toContain('hours')
    })

    it('returns an empty array when no tokens match', async () => {
      const school = await schoolRepo.save({
        name: 'Acme',
        slug: 'acme',
        isActive: true,
      })
      await kbRepo.save({
        schoolId: school.id,
        question: 'Operating hours',
        answer: 'Open 7am to 6pm.',
        source: KnowledgeBaseSource.Manual,
      })

      const results = await service.search(school.id, 'xyzzy qux', null)

      expect(results).toEqual([])
    })

    it('ignores inactive entries', async () => {
      const school = await schoolRepo.save({
        name: 'Acme',
        slug: 'acme',
        isActive: true,
      })
      await kbRepo.save({
        schoolId: school.id,
        question: 'Hours?',
        answer: 'Open.',
        source: KnowledgeBaseSource.Manual,
        isActive: false,
      })

      const results = await service.search(school.id, 'hours', null)

      expect(results).toEqual([])
    })

    it('scopes to the given school', async () => {
      const schoolA = await schoolRepo.save({
        name: 'A',
        slug: 'a',
        isActive: true,
      })
      const schoolB = await schoolRepo.save({
        name: 'B',
        slug: 'b',
        isActive: true,
      })
      await kbRepo.save({
        schoolId: schoolB.id,
        question: 'hours?',
        answer: 'open',
        source: KnowledgeBaseSource.Manual,
      })

      const results = await service.search(schoolA.id, 'hours', null)

      expect(results).toEqual([])
    })
  })

  describe('create', () => {
    it('creates a manual entry for the school, trimming question and answer', async () => {
      const saved = makeEntry({
        id: 'new-entry',
        question: 'New question?',
        answer: 'New answer.',
        isBaseInquiry: false,
        baseInquiryKey: null,
      })
      repo.create.mockImplementation((v: Partial<KnowledgeBaseEntry>) => v as KnowledgeBaseEntry)
      repo.save.mockResolvedValue(saved)

      const result = await service.create('school-1', {
        question: '  New question?  ',
        answer: '  New answer.  ',
      })

      expect(repo.create).toHaveBeenCalledWith({
        schoolId: 'school-1',
        question: 'New question?',
        answer: 'New answer.',
        source: KnowledgeBaseSource.Manual,
        isBaseInquiry: false,
        baseInquiryKey: null,
        embedding: null,
        handbookVersionId: null,
        isActive: true,
      })
      expect(repo.save).toHaveBeenCalled()
      expect(result).toEqual(saved)
    })
  })
})

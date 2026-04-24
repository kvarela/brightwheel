import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ILike } from 'typeorm'
import { KnowledgeBaseService } from './knowledge-base.service'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { BaseInquiryKey, KnowledgeBaseSource } from '@brightwheel/shared'

const makeEntry = (overrides: Partial<KnowledgeBaseEntry> = {}): KnowledgeBaseEntry =>
  ({
    id: 'entry-1',
    schoolId: 'school-1',
    question: 'What are your hours?',
    answer: 'We are open 7am–6pm.',
    embedding: null,
    isBaseInquiry: true,
    baseInquiryKey: BaseInquiryKey.OperatingHours,
    source: KnowledgeBaseSource.Manual,
    handbookVersionId: null,
    handbookVersion: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    school: null as any,
    ...overrides,
  }) as KnowledgeBaseEntry

describe('KnowledgeBaseService', () => {
  let service: KnowledgeBaseService
  let repo: { find: jest.Mock }

  beforeEach(async () => {
    repo = { find: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeBaseService,
        { provide: getRepositoryToken(KnowledgeBaseEntry), useValue: repo },
      ],
    }).compile()

    service = module.get<KnowledgeBaseService>(KnowledgeBaseService)
  })

  describe('findBySchool', () => {
    it('returns all active entries without a search term', async () => {
      const entries = [makeEntry()]
      repo.find.mockResolvedValue(entries)

      const result = await service.findBySchool('school-1')

      expect(result).toEqual(entries)
      expect(repo.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1', isActive: true },
        order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
      })
    })

    it('searches question and answer fields with ILike when search provided', async () => {
      const entries = [makeEntry()]
      repo.find.mockResolvedValue(entries)

      const result = await service.findBySchool('school-1', 'hours')

      expect(result).toEqual(entries)
      expect(repo.find).toHaveBeenCalledWith({
        where: [
          { schoolId: 'school-1', isActive: true, question: ILike('%hours%') },
          { schoolId: 'school-1', isActive: true, answer: ILike('%hours%') },
        ],
        order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
      })
    })

    it('ignores whitespace-only search terms', async () => {
      repo.find.mockResolvedValue([])

      await service.findBySchool('school-1', '   ')

      expect(repo.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1', isActive: true },
        order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
      })
    })
  })
})

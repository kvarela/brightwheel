import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { HandbookService } from './handbook.service'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookUploadStatus, HandbookFileType } from '@brightwheel/shared'

const makeUpload = (overrides: Partial<HandbookUpload> = {}): HandbookUpload =>
  ({
    id: 'upload-1',
    schoolId: 'school-1',
    fileKey: 's3/key.pdf',
    fileName: 'handbook.pdf',
    fileType: HandbookFileType.Pdf,
    status: HandbookUploadStatus.Completed,
    uploadedById: 'staff-1',
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    school: null as any,
    uploadedBy: { id: 'staff-1', fullName: 'Jane', email: 'jane@school.com' } as any,
    ...overrides,
  }) as HandbookUpload

describe('HandbookService', () => {
  let service: HandbookService
  let repo: { find: jest.Mock }

  beforeEach(async () => {
    repo = { find: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookService,
        { provide: getRepositoryToken(HandbookUpload), useValue: repo },
      ],
    }).compile()

    service = module.get<HandbookService>(HandbookService)
  })

  describe('findBySchool', () => {
    it('returns uploads for the school ordered by createdAt DESC', async () => {
      const uploads = [makeUpload(), makeUpload({ id: 'upload-2', status: HandbookUploadStatus.Processing })]
      repo.find.mockResolvedValue(uploads)

      const result = await service.findBySchool('school-1')

      expect(result).toEqual(uploads)
      expect(repo.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        relations: ['uploadedBy'],
        order: { createdAt: 'DESC' },
      })
    })

    it('returns empty array when no uploads exist', async () => {
      repo.find.mockResolvedValue([])
      const result = await service.findBySchool('school-1')
      expect(result).toEqual([])
    })
  })
})

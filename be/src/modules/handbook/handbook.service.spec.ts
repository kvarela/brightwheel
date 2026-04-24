import { BadRequestException, NotFoundException } from '@nestjs/common'
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
  let repo: { find: jest.Mock; findOne: jest.Mock; remove: jest.Mock }

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn(), remove: jest.fn() }

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

  describe('deleteUpload', () => {
    it('removes a pending upload scoped to the school', async () => {
      const upload = makeUpload({ status: HandbookUploadStatus.Pending })
      repo.findOne.mockResolvedValue(upload)

      await service.deleteUpload('upload-1', 'school-1')

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'upload-1', schoolId: 'school-1' },
      })
      expect(repo.remove).toHaveBeenCalledWith(upload)
    })

    it('removes a failed upload', async () => {
      const upload = makeUpload({ status: HandbookUploadStatus.Failed })
      repo.findOne.mockResolvedValue(upload)

      await service.deleteUpload('upload-1', 'school-1')

      expect(repo.remove).toHaveBeenCalledWith(upload)
    })

    it('removes a processing upload', async () => {
      const upload = makeUpload({ status: HandbookUploadStatus.Processing })
      repo.findOne.mockResolvedValue(upload)

      await service.deleteUpload('upload-1', 'school-1')

      expect(repo.remove).toHaveBeenCalledWith(upload)
    })

    it('throws NotFoundException when the upload does not exist for the school', async () => {
      repo.findOne.mockResolvedValue(null)

      await expect(service.deleteUpload('upload-1', 'school-1')).rejects.toThrow(
        NotFoundException,
      )
      expect(repo.remove).not.toHaveBeenCalled()
    })

    it('throws BadRequestException when the upload is completed', async () => {
      repo.findOne.mockResolvedValue(
        makeUpload({ status: HandbookUploadStatus.Completed }),
      )

      await expect(service.deleteUpload('upload-1', 'school-1')).rejects.toThrow(
        BadRequestException,
      )
      expect(repo.remove).not.toHaveBeenCalled()
    })
  })
})

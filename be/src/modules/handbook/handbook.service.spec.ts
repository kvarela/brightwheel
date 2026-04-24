import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { HandbookService } from './handbook.service'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'
import {
  ExtractionConfidence,
  HandbookDiffChangeType,
  HandbookDiffStatus,
  HandbookFileType,
  HandbookUploadStatus,
} from '@brightwheel/shared'

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
    createdAt: new Date('2026-04-23T22:23:00.000Z'),
    updatedAt: new Date('2026-04-23T22:23:00.000Z'),
    school: null as any,
    uploadedBy: { id: 'staff-1', fullName: 'Jane', email: 'jane@school.com' } as any,
    ...overrides,
  }) as HandbookUpload

const makeDiff = (overrides: Partial<HandbookDiffEntry> = {}): HandbookDiffEntry =>
  ({
    id: 'diff-1',
    handbookVersionId: 'version-1',
    knowledgeBaseEntryId: 'kb-1',
    knowledgeBaseEntry: null,
    handbookVersion: null as any,
    changeType: HandbookDiffChangeType.Add,
    proposedQuestion: 'What time does pickup end?',
    proposedAnswer: 'Pickup ends at 6pm.',
    sourceExcerpt: 'Pickup: 3:00 PM – 6:00 PM',
    extractionConfidence: ExtractionConfidence.High,
    status: HandbookDiffStatus.Pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as HandbookDiffEntry

describe('HandbookService', () => {
  let service: HandbookService
  let uploadRepo: { find: jest.Mock; findOne: jest.Mock }
  let versionRepo: { findOne: jest.Mock }
  let diffRepo: { find: jest.Mock }

  beforeEach(async () => {
    uploadRepo = { find: jest.fn(), findOne: jest.fn() }
    versionRepo = { findOne: jest.fn() }
    diffRepo = { find: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandbookService,
        { provide: getRepositoryToken(HandbookUpload), useValue: uploadRepo },
        { provide: getRepositoryToken(HandbookVersion), useValue: versionRepo },
        { provide: getRepositoryToken(HandbookDiffEntry), useValue: diffRepo },
      ],
    }).compile()

    service = module.get<HandbookService>(HandbookService)
  })

  describe('findBySchool', () => {
    it('returns uploads for the school ordered by createdAt DESC', async () => {
      const uploads = [makeUpload(), makeUpload({ id: 'upload-2', status: HandbookUploadStatus.Processing })]
      uploadRepo.find.mockResolvedValue(uploads)

      const result = await service.findBySchool('school-1')

      expect(result).toEqual(uploads)
      expect(uploadRepo.find).toHaveBeenCalledWith({
        where: { schoolId: 'school-1' },
        relations: ['uploadedBy'],
        order: { createdAt: 'DESC' },
      })
    })

    it('returns empty array when no uploads exist', async () => {
      uploadRepo.find.mockResolvedValue([])
      const result = await service.findBySchool('school-1')
      expect(result).toEqual([])
    })
  })

  describe('findUploadDetail', () => {
    it('returns upload detail with extracted inquiries', async () => {
      const upload = makeUpload()
      uploadRepo.findOne.mockResolvedValue(upload)
      versionRepo.findOne.mockResolvedValue({ id: 'version-1', uploadId: upload.id })
      diffRepo.find.mockResolvedValue([
        makeDiff({ proposedQuestion: 'Q1', proposedAnswer: 'A1' }),
        makeDiff({
          id: 'diff-2',
          proposedQuestion: 'Q2',
          proposedAnswer: 'A2',
          extractionConfidence: ExtractionConfidence.Medium,
        }),
      ])

      const result = await service.findUploadDetail('school-1', upload.id)

      expect(uploadRepo.findOne).toHaveBeenCalledWith({
        where: { id: upload.id, schoolId: 'school-1' },
        relations: ['uploadedBy'],
      })
      expect(versionRepo.findOne).toHaveBeenCalledWith({
        where: { uploadId: upload.id },
      })
      expect(diffRepo.find).toHaveBeenCalledWith({
        where: { handbookVersionId: 'version-1' },
        order: { createdAt: 'ASC' },
      })
      expect(result).toEqual({
        id: upload.id,
        fileName: upload.fileName,
        fileType: upload.fileType,
        status: upload.status,
        errorMessage: null,
        createdAt: upload.createdAt.toISOString(),
        uploadedBy: { id: 'staff-1', fullName: 'Jane', email: 'jane@school.com' },
        inquiries: [
          {
            question: 'Q1',
            answer: 'A1',
            sourceExcerpt: 'Pickup: 3:00 PM – 6:00 PM',
            confidence: ExtractionConfidence.High,
          },
          {
            question: 'Q2',
            answer: 'A2',
            sourceExcerpt: 'Pickup: 3:00 PM – 6:00 PM',
            confidence: ExtractionConfidence.Medium,
          },
        ],
      })
    })

    it('returns empty inquiries when no version exists yet', async () => {
      const upload = makeUpload({ status: HandbookUploadStatus.Pending })
      uploadRepo.findOne.mockResolvedValue(upload)
      versionRepo.findOne.mockResolvedValue(null)

      const result = await service.findUploadDetail('school-1', upload.id)

      expect(diffRepo.find).not.toHaveBeenCalled()
      expect(result.inquiries).toEqual([])
      expect(result.status).toBe(HandbookUploadStatus.Pending)
    })

    it('throws NotFoundException when upload does not belong to the school', async () => {
      uploadRepo.findOne.mockResolvedValue(null)

      await expect(service.findUploadDetail('school-1', 'upload-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})

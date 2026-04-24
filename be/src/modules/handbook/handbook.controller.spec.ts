import { Test } from '@nestjs/testing'
import { HandbookFileType, HandbookUploadStatus } from '@brightwheel/shared'

import { HandbookController } from './handbook.controller'
import { HandbookUploadService } from './services/handbook-upload.service'
import { HandbookRequestContextService } from './services/handbook-request-context.service'
import { HandbookService } from './handbook.service'

describe('HandbookController', () => {
  let controller: HandbookController
  let uploadService: jest.Mocked<HandbookUploadService>
  let contextService: jest.Mocked<HandbookRequestContextService>
  let handbookService: jest.Mocked<HandbookService>

  beforeEach(async () => {
    uploadService = {
      createSignedUpload: jest.fn(),
      processUpload: jest.fn(),
    } as unknown as jest.Mocked<HandbookUploadService>

    contextService = {
      resolve: jest.fn(),
    } as unknown as jest.Mocked<HandbookRequestContextService>

    handbookService = {
      findBySchool: jest.fn(),
      findUploadDetail: jest.fn(),
    } as unknown as jest.Mocked<HandbookService>

    const moduleRef = await Test.createTestingModule({
      controllers: [HandbookController],
      providers: [
        { provide: HandbookUploadService, useValue: uploadService },
        { provide: HandbookRequestContextService, useValue: contextService },
        { provide: HandbookService, useValue: handbookService },
      ],
    }).compile()

    controller = moduleRef.get(HandbookController)
  })

  it('forwards header identifiers when creating a signed URL', async () => {
    contextService.resolve.mockResolvedValue({
      schoolId: 'school-1',
      staffUserId: 'staff-1',
    })
    uploadService.createSignedUpload.mockResolvedValue({
      uploadId: 'upload-1',
      fileKey: 'key',
      uploadUrl: 'https://example.com/x',
      expiresInSeconds: 900,
    })

    const body = {
      fileName: 'handbook.pdf',
      fileType: HandbookFileType.Pdf,
      contentType: 'application/pdf',
    }

    const result = await controller.createSignedUpload(body, 'school-1', 'staff-1')
    expect(contextService.resolve).toHaveBeenCalledWith('school-1', 'staff-1')
    expect(uploadService.createSignedUpload).toHaveBeenCalledWith(
      'school-1',
      'staff-1',
      body,
    )
    expect(result.uploadUrl).toBe('https://example.com/x')
  })

  it('delegates to the upload service for processing', async () => {
    uploadService.processUpload.mockResolvedValue({
      uploadId: 'u1',
      versionId: 'v1',
      status: HandbookUploadStatus.Completed,
      inquiriesExtracted: 3,
      inquiries: [],
    })
    const result = await controller.processUpload({ uploadId: 'u1' })
    expect(uploadService.processUpload).toHaveBeenCalledWith('u1')
    expect(result.inquiriesExtracted).toBe(3)
  })

  it('lists uploads for the authenticated staff user\'s school', async () => {
    const uploads = [{ id: 'u1' }, { id: 'u2' }] as never
    handbookService.findBySchool.mockResolvedValue(uploads)

    const req = { user: { schoolId: 'school-42' } } as never
    const result = await controller.getUploads(req)

    expect(handbookService.findBySchool).toHaveBeenCalledWith('school-42')
    expect(result).toBe(uploads)
  })

  it('returns upload detail scoped to the staff user\'s school', async () => {
    const detail = {
      id: 'u1',
      fileName: 'handbook.pdf',
      inquiries: [],
    } as never
    handbookService.findUploadDetail.mockResolvedValue(detail)

    const req = { user: { schoolId: 'school-42' } } as never
    const result = await controller.getUploadDetail(req, 'u1')

    expect(handbookService.findUploadDetail).toHaveBeenCalledWith('school-42', 'u1')
    expect(result).toBe(detail)
  })
})

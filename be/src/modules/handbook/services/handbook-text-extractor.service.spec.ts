import { BadRequestException } from '@nestjs/common'
import { HandbookFileType } from '@brightwheel/shared'
import { HandbookTextExtractorService } from './handbook-text-extractor.service'

describe('HandbookTextExtractorService', () => {
  const service = new HandbookTextExtractorService()

  it('reads plain text buffers verbatim', async () => {
    const buffer = Buffer.from('  Welcome to our center.  ', 'utf8')
    const result = await service.extractText(buffer, HandbookFileType.Txt)
    expect(result).toBe('Welcome to our center.')
  })

  it('throws on an unsupported file type', async () => {
    await expect(
      service.extractText(Buffer.from(''), 'xlsx' as HandbookFileType),
    ).rejects.toThrow(BadRequestException)
  })
})

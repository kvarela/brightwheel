import { BadRequestException, Injectable } from '@nestjs/common'
import { HandbookFileType } from '@brightwheel/shared'

// CommonJS modules (no type-compatible default export; using require keeps tsc happy without esModuleInterop)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mammoth = require('mammoth') as {
  extractRawText: (input: { buffer: Buffer }) => Promise<{ value: string }>
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (
  data: Buffer,
) => Promise<{ text: string }>

@Injectable()
export class HandbookTextExtractorService {
  async extractText(buffer: Buffer, fileType: HandbookFileType): Promise<string> {
    switch (fileType) {
      case HandbookFileType.Pdf: {
        const result = await pdfParse(buffer)
        return result.text.trim()
      }
      case HandbookFileType.Docx: {
        const result = await mammoth.extractRawText({ buffer })
        return result.value.trim()
      }
      case HandbookFileType.Txt: {
        return buffer.toString('utf8').trim()
      }
      default:
        throw new BadRequestException(`Unsupported file type: ${fileType as string}`)
    }
  }
}

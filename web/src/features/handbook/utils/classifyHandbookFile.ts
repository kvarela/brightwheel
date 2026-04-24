import { HandbookFileType } from '@brightwheel/shared'

export interface ClassifiedHandbookFile {
  fileType: HandbookFileType
  contentType: string
}

const EXTENSION_MAP: Record<string, ClassifiedHandbookFile> = {
  pdf: { fileType: HandbookFileType.Pdf, contentType: 'application/pdf' },
  docx: {
    fileType: HandbookFileType.Docx,
    contentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  txt: { fileType: HandbookFileType.Txt, contentType: 'text/plain' },
}

export const SUPPORTED_EXTENSIONS = Object.keys(EXTENSION_MAP)

export function classifyHandbookFile(file: File): ClassifiedHandbookFile | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) return null
  return EXTENSION_MAP[extension] ?? null
}

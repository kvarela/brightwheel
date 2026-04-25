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

export const SUPPORTED_FILE_PICKER_ACCEPT = [
  ...SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`),
  ...Object.values(EXTENSION_MAP).map((entry) => entry.contentType),
].join(',')

export function classifyHandbookFile(file: File): ClassifiedHandbookFile | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) return null
  return EXTENSION_MAP[extension] ?? null
}

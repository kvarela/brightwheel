import { BaseInquiryKey, KnowledgeBaseSource } from '@brightwheel/shared'

export class KnowledgeBaseEntryResponseDto {
  id: string
  question: string
  answer: string
  isBaseInquiry: boolean
  baseInquiryKey: BaseInquiryKey | null
  source: KnowledgeBaseSource
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

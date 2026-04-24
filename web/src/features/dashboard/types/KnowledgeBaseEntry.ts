export type KnowledgeBaseSource = 'manual' | 'handbook_extraction' | 'escalation_learning'

export interface KnowledgeBaseEntry {
  id: string
  question: string
  answer: string
  isBaseInquiry: boolean
  baseInquiryKey: string | null
  source: KnowledgeBaseSource
  isActive: boolean
  createdAt: string
  updatedAt: string
}

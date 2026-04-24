import { ExtractionConfidence } from '../enums/extraction-confidence.enum'

export interface ExtractedInquiryDto {
  question: string
  answer: string
  sourceExcerpt: string | null
  confidence: ExtractionConfidence
}

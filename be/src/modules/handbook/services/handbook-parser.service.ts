import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { ExtractedInquiryDto, ExtractionConfidence } from '@brightwheel/shared'

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const MAX_OUTPUT_TOKENS = 8000
const MAX_HANDBOOK_CHARS = 180_000

const SYSTEM_PROMPT = `You are extracting a parent-facing FAQ from a childcare center's handbook.

For each distinct topic a parent might ask about, produce ONE question/answer pair:
- "question" is written as a parent would naturally ask it (conversational, first person where appropriate).
- "answer" is a complete, direct answer sourced verbatim-or-closely from the handbook. Do not invent facts.
- "sourceExcerpt" is the relevant sentence(s) from the handbook that back the answer (<= 400 chars), or null if not applicable.
- "confidence" is "high" when the handbook states the answer explicitly, "medium" when it requires light paraphrasing, "low" when the handbook only hints at it.

Cover at minimum these topics when the handbook discusses them: operating hours, tuition and fees, enrollment process, age groups, drop-off and pick-up, meals and snacks, illness policy, parent communication, staff-to-child ratios, outdoor activity, emergency procedures, waitlist process.

Respond with ONLY a JSON object of the form:
{ "inquiries": [ { "question": "...", "answer": "...", "sourceExcerpt": "..." | null, "confidence": "high" | "medium" | "low" } ] }

No prose, no markdown, no code fences. Aim for 12-30 high-quality Q&A pairs.`

interface AnthropicExtractionPayload {
  inquiries: Array<{
    question: unknown
    answer: unknown
    sourceExcerpt?: unknown
    confidence?: unknown
  }>
}

@Injectable()
export class HandbookParserService {
  private readonly logger = new Logger(HandbookParserService.name)
  private readonly client: Anthropic

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') ?? ''
    this.client = new Anthropic({ apiKey })
  }

  async extractInquiries(handbookText: string): Promise<ExtractedInquiryDto[]> {
    const trimmed = handbookText.slice(0, MAX_HANDBOOK_CHARS)
    const userMessage = `Here is the handbook text. Extract the parent-facing FAQ now.\n\n<handbook>\n${trimmed}\n</handbook>`

    const response = await this.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new InternalServerErrorException('Claude returned no text content')
    }

    const parsed = this.parseJson(textBlock.text)
    return this.normalizeInquiries(parsed)
  }

  private parseJson(raw: string): AnthropicExtractionPayload {
    const jsonSlice = this.isolateJsonObject(raw)
    try {
      return JSON.parse(jsonSlice) as AnthropicExtractionPayload
    } catch (error) {
      this.logger.error(`Failed to parse Claude response as JSON: ${(error as Error).message}`)
      throw new InternalServerErrorException('Handbook extraction returned malformed JSON')
    }
  }

  private isolateJsonObject(raw: string): string {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1 || end < start) {
      return raw
    }
    return raw.slice(start, end + 1)
  }

  private normalizeInquiries(payload: AnthropicExtractionPayload): ExtractedInquiryDto[] {
    if (!payload || !Array.isArray(payload.inquiries)) {
      throw new InternalServerErrorException(
        'Handbook extraction response missing inquiries array',
      )
    }

    const inquiries: ExtractedInquiryDto[] = []
    for (const raw of payload.inquiries) {
      const question = typeof raw.question === 'string' ? raw.question.trim() : ''
      const answer = typeof raw.answer === 'string' ? raw.answer.trim() : ''
      if (!question || !answer) continue

      const sourceExcerpt =
        typeof raw.sourceExcerpt === 'string' && raw.sourceExcerpt.trim().length > 0
          ? raw.sourceExcerpt.trim()
          : null

      inquiries.push({
        question,
        answer,
        sourceExcerpt,
        confidence: this.normalizeConfidence(raw.confidence),
      })
    }
    return inquiries
  }

  private normalizeConfidence(value: unknown): ExtractionConfidence {
    if (typeof value !== 'string') return ExtractionConfidence.Medium
    const lower = value.toLowerCase()
    if (lower === ExtractionConfidence.High) return ExtractionConfidence.High
    if (lower === ExtractionConfidence.Low) return ExtractionConfidence.Low
    return ExtractionConfidence.Medium
  }
}

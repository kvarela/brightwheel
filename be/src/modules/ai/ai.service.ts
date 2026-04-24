import Anthropic from '@anthropic-ai/sdk'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

export interface RetrievedKbContext {
  question: string
  answer: string
  similarity: number
}

export interface GenerateResponseResult {
  answer: string
  modelConfidence: number
}

const EMBEDDING_MODEL = 'text-embedding-3-small'
const GENERATION_MODEL = 'claude-sonnet-4-6'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private readonly openai: OpenAI | null
  private readonly anthropic: Anthropic | null

  constructor(configService: ConfigService) {
    const openaiKey = configService.get<string>('OPENAI_API_KEY')
    const anthropicKey = configService.get<string>('ANTHROPIC_API_KEY')
    this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null
    this.anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.openai) return null
    try {
      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      })
      return response.data[0]?.embedding ?? null
    } catch (err) {
      this.logger.error('Failed to generate embedding', err as Error)
      return null
    }
  }

  async generateResponse(
    schoolName: string,
    question: string,
    context: RetrievedKbContext[],
  ): Promise<GenerateResponseResult> {
    if (!this.anthropic) {
      return this.fallbackResponse(context)
    }

    const contextBlock =
      context.length > 0
        ? context
            .map(
              (c, i) =>
                `[${i + 1}] Q: ${c.question}\nA: ${c.answer}\n(similarity: ${c.similarity.toFixed(2)})`,
            )
            .join('\n\n')
        : '(no matching entries found in the knowledge base)'

    const systemPrompt = `You are an AI front desk for ${schoolName}. You answer parent questions using ONLY the knowledge base entries below. If the knowledge base does not contain a clear answer to the parent's question, you must say so honestly and that a staff member will follow up.

Respond in 2-4 short, friendly sentences.

At the end of your response, on a new line, output exactly:
CONFIDENCE: <number between 0.0 and 1.0>

Where the number represents how confident you are that your answer is directly and fully supported by the knowledge base. Use 0.9+ only when the knowledge base has a clear, direct answer. Use <0.5 if you had to guess or say you don't know.

Knowledge base:
${contextBlock}`

    try {
      const response = await this.anthropic.messages.create({
        model: GENERATION_MODEL,
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      })
      const raw = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
      return this.parseResponse(raw)
    } catch (err) {
      this.logger.error('Failed to call Anthropic', err as Error)
      return this.fallbackResponse(context)
    }
  }

  private parseResponse(raw: string): GenerateResponseResult {
    const match = raw.match(/CONFIDENCE:\s*([0-9]*\.?[0-9]+)/i)
    const confidence = match ? parseFloat(match[1]) : 0.5
    const answer = raw.replace(/CONFIDENCE:\s*[0-9]*\.?[0-9]+/i, '').trim()
    return {
      answer: answer || "I'm not sure — a staff member will follow up shortly.",
      modelConfidence: Math.max(0, Math.min(1, confidence)),
    }
  }

  private fallbackResponse(context: RetrievedKbContext[]): GenerateResponseResult {
    const top = context[0]
    if (top && top.similarity >= 0.6) {
      return {
        answer: top.answer,
        modelConfidence: top.similarity,
      }
    }
    return {
      answer:
        "I don't have that information in our knowledge base yet, but I've flagged this for a staff member who will follow up shortly.",
      modelConfidence: 0.2,
    }
  }
}

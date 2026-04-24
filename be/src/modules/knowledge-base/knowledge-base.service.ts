import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { KnowledgeBaseSource } from '@brightwheel/shared'
import { AiService } from '../ai/ai.service'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { CreateKnowledgeBaseEntryDto } from './dto/create-knowledge-base-entry.dto'

export interface KbSearchResult {
  entry: KnowledgeBaseEntry
  similarity: number
}

const MAX_RESULTS = 4

@Injectable()
export class KnowledgeBaseService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeBaseService.name)

  constructor(
    @InjectRepository(KnowledgeBaseEntry)
    private readonly kbRepository: Repository<KnowledgeBaseEntry>,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.backfillEmbeddings()
  }

  async backfillEmbeddings(): Promise<void> {
    const entries = await this.kbRepository.find({
      where: { embedding: IsNull(), isActive: true },
    })
    if (entries.length === 0) return

    this.logger.log(`Backfilling embeddings for ${entries.length} KB entries`)
    for (const entry of entries) {
      const text = `${entry.question} ${entry.answer}`
      const embedding = await this.aiService.generateEmbedding(text)
      if (embedding) {
        await this.kbRepository.update(entry.id, { embedding })
      }
    }
    this.logger.log('Embedding backfill complete')
  }

  async search(
    schoolId: string,
    question: string,
    queryEmbedding: number[] | null,
  ): Promise<KbSearchResult[]> {
    if (queryEmbedding && queryEmbedding.length > 0) {
      const results = await this.vectorSearch(schoolId, queryEmbedding)
      if (results.length > 0) return results
    }
    return this.textSearch(schoolId, question)
  }

  private async vectorSearch(
    schoolId: string,
    queryEmbedding: number[],
  ): Promise<KbSearchResult[]> {
    const embeddingLiteral = `[${queryEmbedding.join(',')}]`
    const rows = await this.kbRepository
      .createQueryBuilder('entry')
      .where('entry.schoolId = :schoolId', { schoolId })
      .andWhere('entry.isActive = true')
      .andWhere('entry.embedding IS NOT NULL')
      .select([
        'entry.id AS id',
        'entry.schoolId AS "schoolId"',
        'entry.question AS question',
        'entry.answer AS answer',
      ])
      .addSelect(`1 - (entry.embedding::vector <=> :queryEmbedding::vector)`, 'similarity')
      .orderBy('similarity', 'DESC')
      .limit(MAX_RESULTS)
      .setParameter('queryEmbedding', embeddingLiteral)
      .getRawMany<{
        id: string
        schoolId: string
        question: string
        answer: string
        similarity: string
      }>()

    return rows.map((row) => ({
      entry: {
        id: row.id,
        schoolId: row.schoolId,
        question: row.question,
        answer: row.answer,
      } as KnowledgeBaseEntry,
      similarity: Number(row.similarity),
    }))
  }

  private async textSearch(schoolId: string, question: string): Promise<KbSearchResult[]> {
    const entries = await this.kbRepository.find({
      where: { schoolId, isActive: true },
    })
    const tokens = tokenize(question)
    if (tokens.size === 0) return []

    const scored = entries
      .map((entry) => {
        const combined = `${entry.question} ${entry.answer}`
        const entryTokens = tokenize(combined)
        const similarity = jaccard(tokens, entryTokens)
        return { entry, similarity }
      })
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_RESULTS)

    return scored
  }

  async findBySchool(schoolId: string, search?: string): Promise<KnowledgeBaseEntry[]> {
    const baseWhere = { schoolId, isActive: true }

    if (search?.trim()) {
      const pattern = ILike(`%${search.trim()}%`)
      return this.kbRepository.find({
        where: [
          { ...baseWhere, question: pattern },
          { ...baseWhere, answer: pattern },
        ],
        order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
      })
    }

    return this.kbRepository.find({
      where: baseWhere,
      order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
    })
  }

  create(schoolId: string, dto: CreateKnowledgeBaseEntryDto): Promise<KnowledgeBaseEntry> {
    const entry = this.kbRepository.create({
      schoolId,
      question: dto.question.trim(),
      answer: dto.answer.trim(),
      source: KnowledgeBaseSource.Manual,
      isBaseInquiry: false,
      baseInquiryKey: null,
      embedding: null,
      handbookVersionId: null,
      isActive: true,
    })
    return this.kbRepository.save(entry)
  }
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2),
  )
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const token of a) {
    if (b.has(token)) intersection++
  }
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

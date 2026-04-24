import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'

export interface KbSearchResult {
  entry: KnowledgeBaseEntry
  similarity: number
}

const MAX_RESULTS = 4

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBaseEntry)
    private readonly kbRepository: Repository<KnowledgeBaseEntry>,
  ) {}

  async search(
    schoolId: string,
    question: string,
    queryEmbedding: number[] | null,
  ): Promise<KbSearchResult[]> {
    if (queryEmbedding && queryEmbedding.length > 0) {
      return this.vectorSearch(schoolId, queryEmbedding)
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
      .addSelect(
        `1 - (entry.embedding::vector <=> :queryEmbedding::vector)`,
        'similarity',
      )
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

  private async textSearch(
    schoolId: string,
    question: string,
  ): Promise<KbSearchResult[]> {
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

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeBaseEntry)
    private readonly kbEntryRepo: Repository<KnowledgeBaseEntry>,
  ) {}

  findBySchool(schoolId: string, search?: string): Promise<KnowledgeBaseEntry[]> {
    const baseWhere = { schoolId, isActive: true }

    if (search?.trim()) {
      const pattern = ILike(`%${search.trim()}%`)
      return this.kbEntryRepo.find({
        where: [
          { ...baseWhere, question: pattern },
          { ...baseWhere, answer: pattern },
        ],
        order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
      })
    }

    return this.kbEntryRepo.find({
      where: baseWhere,
      order: { isBaseInquiry: 'DESC', createdAt: 'ASC' },
    })
  }
}

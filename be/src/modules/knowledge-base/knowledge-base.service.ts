import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { KnowledgeBaseSource } from '@brightwheel/shared'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { CreateKnowledgeBaseEntryDto } from './dto/create-knowledge-base-entry.dto'

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

  create(schoolId: string, dto: CreateKnowledgeBaseEntryDto): Promise<KnowledgeBaseEntry> {
    const entry = this.kbEntryRepo.create({
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
    return this.kbEntryRepo.save(entry)
  }
}

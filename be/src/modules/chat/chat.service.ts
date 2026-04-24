import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatSessionStatus } from '@brightwheel/shared'
import { ChatSession } from './entities/chat-session.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepo: Repository<ChatSession>,
  ) {}

  findLiveBySchool(schoolId: string): Promise<ChatSession[]> {
    return this.chatSessionRepo.find({
      where: [
        { schoolId, status: ChatSessionStatus.Active },
        { schoolId, status: ChatSessionStatus.Escalated },
      ],
      relations: ['assignedStaff'],
      order: { escalatedAt: 'DESC', createdAt: 'DESC' },
    })
  }
}

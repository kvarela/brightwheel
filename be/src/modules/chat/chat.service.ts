import { randomBytes } from 'crypto'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  ChatMessageDto,
  ChatSessionDto,
  ChatSessionStatus,
  EscalationEventDto,
  InboxState,
  MessageRole,
  NewParentMessageEventDto,
  SendMessageResponseDto,
} from '@brightwheel/shared'
import { AiService } from '../ai/ai.service'
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service'
import { NotificationService } from '../notification/notification.service'
import { NotificationGateway } from '../notification/notification.gateway'
import { ParentGateway } from '../notification/parent.gateway'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { ChatSessionResponseDto } from './dto/chat-session-response.dto'
import { ChatSession } from './entities/chat-session.entity'
import { Message } from './entities/message.entity'
import { MessageKnowledgeBaseEntry } from './entities/message-knowledge-base-entry.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageKnowledgeBaseEntry)
    private readonly messageKbRepository: Repository<MessageKnowledgeBaseEntry>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(StaffUser)
    private readonly staffUserRepository: Repository<StaffUser>,
    private readonly aiService: AiService,
    private readonly kbService: KnowledgeBaseService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    private readonly parentGateway: ParentGateway,
  ) {}

  async createSession(
    schoolId: string,
    parentName?: string,
    parentEmail?: string,
  ): Promise<ChatSession> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    })
    if (!school) throw new NotFoundException(`School ${schoolId} not found`)

    const sessionToken = randomBytes(24).toString('hex')
    const session = this.sessionRepository.create({
      schoolId,
      sessionToken,
      parentName: parentName ?? null,
      parentEmail: parentEmail ?? null,
      status: ChatSessionStatus.Active,
      inboxState: null,
    })
    return this.sessionRepository.save(session)
  }

  async findByToken(sessionToken: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({
      where: { sessionToken },
    })
    if (!session) throw new NotFoundException('Session not found')
    return session
  }

  async handleParentMessage(
    sessionToken: string,
    content: string,
  ): Promise<SendMessageResponseDto> {
    const session = await this.findByToken(sessionToken)
    const school = await this.schoolRepository.findOneOrFail({
      where: { id: session.schoolId },
    })

    const parentMessage = await this.messageRepository.save(
      this.messageRepository.create({
        chatSessionId: session.id,
        role: MessageRole.Parent,
        content,
      }),
    )

    const queryEmbedding = await this.aiService.generateEmbedding(content)
    const kbResults = await this.kbService.search(session.schoolId, content, queryEmbedding)

    const topSimilarity = kbResults[0]?.similarity ?? 0
    const generated = await this.aiService.generateResponse(
      school.name,
      content,
      kbResults.map((r) => ({
        question: r.entry.question,
        answer: r.entry.answer,
        similarity: r.similarity,
      })),
    )

    const certaintyScore = Math.max(
      0,
      Math.min(1, topSimilarity * 0.5 + generated.modelConfidence * 0.5),
    )
    const threshold = Number(school.escalationThreshold)
    const shouldEscalate = certaintyScore < threshold

    const aiMessage = await this.messageRepository.save(
      this.messageRepository.create({
        chatSessionId: session.id,
        role: MessageRole.Ai,
        content: shouldEscalate
          ? `${generated.answer}\n\nI've flagged this for a staff member who will follow up soon.`
          : generated.answer,
        certaintyScore,
        isEscalationTrigger: shouldEscalate,
      }),
    )

    if (kbResults.length > 0) {
      await this.messageKbRepository.save(
        kbResults.map((r) =>
          this.messageKbRepository.create({
            messageId: aiMessage.id,
            knowledgeBaseEntryId: r.entry.id,
            similarityScore: r.similarity,
          }),
        ),
      )
    }

    let escalated = false
    if (shouldEscalate && session.status !== ChatSessionStatus.Escalated) {
      session.status = ChatSessionStatus.Escalated
      session.inboxState = InboxState.NeedsAttention
      session.escalatedAt = new Date()
      await this.sessionRepository.save(session)
      escalated = true

      await this.notificationService.createEscalationForSchool(session.schoolId, session.id)
      const event: EscalationEventDto = {
        chatSessionId: session.id,
        schoolId: session.schoolId,
        parentName: session.parentName,
        lastMessagePreview: content.slice(0, 140),
        certaintyScore,
        escalatedAt: session.escalatedAt.toISOString(),
      }
      this.notificationGateway.emitEscalation(event)
    }

    const responseDto: SendMessageResponseDto = {
      parentMessage: this.toMessageDto(parentMessage, null),
      aiMessage: this.toMessageDto(aiMessage, null),
      escalated,
    }

    if (session.status === ChatSessionStatus.Escalated) {
      const newMessageEvent: NewParentMessageEventDto = {
        chatSessionId: session.id,
        schoolId: session.schoolId,
        parentMessage: responseDto.parentMessage,
        aiMessage: responseDto.aiMessage,
        escalated,
      }
      this.notificationGateway.emitNewParentMessage(newMessageEvent)
    }

    return responseDto
  }

  async listMessages(sessionToken: string): Promise<ChatMessageDto[]> {
    const session = await this.findByToken(sessionToken)
    return this.loadMessagesForSession(session.id)
  }

  async listConversationsForSchool(
    schoolId: string,
    inboxState?: InboxState,
  ): Promise<ChatSessionDto[]> {
    const qb = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.schoolId = :schoolId', { schoolId })

    if (inboxState) {
      qb.andWhere('session.inboxState = :inboxState', { inboxState })
    } else {
      qb.andWhere('session.inboxState IS NOT NULL')
    }

    qb.orderBy('session.escalatedAt', 'DESC', 'NULLS LAST')

    const sessions = await qb.getMany()
    return Promise.all(sessions.map((s) => this.toSessionDto(s)))
  }

  async getConversationForStaff(
    conversationId: string,
    staff: { sub: string; schoolId: string },
  ): Promise<{ session: ChatSessionDto; messages: ChatMessageDto[] }> {
    const session = await this.sessionRepository.findOne({
      where: { id: conversationId },
    })
    if (!session) throw new NotFoundException('Conversation not found')
    if (session.schoolId !== staff.schoolId) throw new ForbiddenException()

    await this.notificationService.markAllReadForSession(staff.sub, conversationId)

    const messages = await this.loadMessagesForSession(session.id)
    const dto = await this.toSessionDto(session)
    return { session: dto, messages }
  }

  async postStaffReply(
    conversationId: string,
    staff: { sub: string; schoolId: string },
    content: string,
  ): Promise<ChatMessageDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: conversationId },
    })
    if (!session) throw new NotFoundException('Conversation not found')
    if (session.schoolId !== staff.schoolId) throw new ForbiddenException()

    if (session.inboxState === InboxState.NeedsAttention || !session.inboxState) {
      session.inboxState = InboxState.InProgress
      session.assignedStaffId = staff.sub
      await this.sessionRepository.save(session)
    }

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        chatSessionId: session.id,
        role: MessageRole.Staff,
        content,
        sentByStaffId: staff.sub,
      }),
    )

    const staffUser = await this.staffUserRepository.findOne({
      where: { id: staff.sub },
    })
    const messageDto = this.toMessageDto(message, staffUser?.fullName ?? null)

    this.parentGateway.emitStaffReply({
      chatSessionId: session.id,
      message: messageDto,
    })

    return messageDto
  }

  async updateInboxState(
    conversationId: string,
    staff: { sub: string; schoolId: string },
    inboxState: InboxState,
  ): Promise<ChatSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: conversationId },
    })
    if (!session) throw new NotFoundException('Conversation not found')
    if (session.schoolId !== staff.schoolId) throw new ForbiddenException()

    session.inboxState = inboxState
    if (inboxState === InboxState.Resolved) {
      session.status = ChatSessionStatus.Resolved
      session.resolvedAt = new Date()
    } else if (inboxState === InboxState.InProgress && !session.assignedStaffId) {
      session.assignedStaffId = staff.sub
    }
    await this.sessionRepository.save(session)
    return this.toSessionDto(session)
  }

  private async loadMessagesForSession(sessionId: string): Promise<ChatMessageDto[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndMapOne('m.sentByStaff', StaffUser, 'staff', 'staff.id = m.sentByStaffId')
      .where('m.chatSessionId = :sessionId', { sessionId })
      .orderBy('m.createdAt', 'ASC')
      .getMany()

    return messages.map((m) => this.toMessageDto(m, m.sentByStaff?.fullName ?? null))
  }

  private toMessageDto(message: Message, sentByStaffName: string | null): ChatMessageDto {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      certaintyScore:
        message.certaintyScore !== null && message.certaintyScore !== undefined
          ? Number(message.certaintyScore)
          : null,
      createdAt: message.createdAt.toISOString(),
      sentByStaffName,
    }
  }

  private async toSessionDto(session: ChatSession): Promise<ChatSessionDto> {
    const last = await this.messageRepository.findOne({
      where: { chatSessionId: session.id },
      order: { createdAt: 'DESC' },
    })
    return {
      id: session.id,
      sessionToken: session.sessionToken,
      schoolId: session.schoolId,
      parentName: session.parentName,
      status: session.status,
      inboxState: session.inboxState,
      escalatedAt: session.escalatedAt?.toISOString() ?? null,
      resolvedAt: session.resolvedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      lastMessagePreview: last ? last.content.slice(0, 160) : null,
      lastCertaintyScore:
        last && last.certaintyScore !== null && last.certaintyScore !== undefined
          ? Number(last.certaintyScore)
          : null,
      unreadForStaff: session.inboxState === InboxState.NeedsAttention,
    }
  }

  async findLiveBySchool(schoolId: string): Promise<ChatSessionResponseDto[]> {
    const sessions = await this.sessionRepository.find({
      where: [
        { schoolId, status: ChatSessionStatus.Active },
        { schoolId, status: ChatSessionStatus.Escalated },
      ],
      relations: ['assignedStaff'],
      order: { escalatedAt: 'DESC', createdAt: 'DESC' },
    })

    return Promise.all(sessions.map((s) => this.toLiveSessionDto(s)))
  }

  private async toLiveSessionDto(session: ChatSession): Promise<ChatSessionResponseDto> {
    const latestParentMessage = await this.messageRepository.findOne({
      where: { chatSessionId: session.id, role: MessageRole.Parent },
      order: { createdAt: 'DESC' },
    })

    return {
      id: session.id,
      parentName: session.parentName,
      parentEmail: session.parentEmail,
      status: session.status,
      inboxState: session.inboxState,
      escalatedAt: session.escalatedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      assignedStaff: session.assignedStaff
        ? {
            id: session.assignedStaff.id,
            fullName: session.assignedStaff.fullName,
            email: session.assignedStaff.email,
          }
        : null,
      latestInquiry: latestParentMessage
        ? {
            content: latestParentMessage.content,
            createdAt: latestParentMessage.createdAt.toISOString(),
          }
        : null,
    }
  }
}

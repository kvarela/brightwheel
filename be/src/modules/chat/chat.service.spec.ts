import { ForbiddenException, INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import {
  ChatSessionStatus,
  InboxState,
  KnowledgeBaseSource,
  MessageRole,
  StaffRole,
} from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { AiService } from '../ai/ai.service'
import { KnowledgeBaseEntry } from '../knowledge-base/entities/knowledge-base-entry.entity'
import { NotificationGateway } from '../notification/notification.gateway'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { ChatService } from './chat.service'
import { ChatSession } from './entities/chat-session.entity'
import { Message } from './entities/message.entity'

describe('ChatService', () => {
  let app: INestApplication
  let db: DataSource
  let service: ChatService
  let schoolRepo: Repository<School>
  let staffRepo: Repository<StaffUser>
  let kbRepo: Repository<KnowledgeBaseEntry>
  let sessionRepo: Repository<ChatSession>
  let messageRepo: Repository<Message>
  let aiGenerateResponse: jest.SpyInstance
  let aiEmbedding: jest.SpyInstance
  let emitEscalation: jest.SpyInstance
  let emitNewMessage: jest.SpyInstance

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    service = app.get(ChatService)
    schoolRepo = app.get(getRepositoryToken(School))
    staffRepo = app.get(getRepositoryToken(StaffUser))
    kbRepo = app.get(getRepositoryToken(KnowledgeBaseEntry))
    sessionRepo = app.get(getRepositoryToken(ChatSession))
    messageRepo = app.get(getRepositoryToken(Message))

    const aiService = app.get(AiService)
    aiEmbedding = jest
      .spyOn(aiService, 'generateEmbedding')
      .mockResolvedValue(null)
    aiGenerateResponse = jest.spyOn(aiService, 'generateResponse')

    const gateway = app.get(NotificationGateway)
    emitEscalation = jest.spyOn(gateway, 'emitEscalation').mockImplementation()
    emitNewMessage = jest
      .spyOn(gateway, 'emitNewParentMessage')
      .mockImplementation()
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
    aiGenerateResponse.mockReset()
    aiEmbedding.mockClear()
    emitEscalation.mockClear()
    emitNewMessage.mockClear()
  })

  async function buildSchool(threshold = 0.8) {
    return schoolRepo.save({
      name: 'Acme Preschool',
      slug: 'acme',
      isActive: true,
      escalationThreshold: threshold,
    })
  }

  describe('createSession', () => {
    it('creates a new session with a unique token and null inbox state', async () => {
      const school = await buildSchool()
      const session = await service.createSession(school.id, 'Alex')

      expect(session.sessionToken).toHaveLength(48)
      expect(session.inboxState).toBeNull()
      expect(session.parentName).toBe('Alex')
      expect(session.status).toBe(ChatSessionStatus.Active)
    })

    it('throws NotFoundException when school does not exist', async () => {
      await expect(
        service.createSession('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow('not found')
    })
  })

  describe('handleParentMessage - high confidence', () => {
    it('does NOT escalate, does not emit escalation, persists AI and parent messages', async () => {
      const school = await buildSchool(0.5)
      await kbRepo.save({
        schoolId: school.id,
        question: 'What are your hours?',
        answer: 'Open 7am to 6pm.',
        source: KnowledgeBaseSource.Manual,
      })
      aiGenerateResponse.mockResolvedValue({
        answer: 'We are open 7am to 6pm.',
        modelConfidence: 1.0,
      })

      const session = await service.createSession(school.id)
      const result = await service.handleParentMessage(
        session.sessionToken,
        'what are your operating hours',
      )

      expect(result.escalated).toBe(false)
      expect(result.aiMessage.content).toBe('We are open 7am to 6pm.')
      expect(result.aiMessage.certaintyScore).toBeGreaterThanOrEqual(0.5)
      expect(emitEscalation).not.toHaveBeenCalled()

      const reloaded = await sessionRepo.findOneOrFail({ where: { id: session.id } })
      expect(reloaded.status).toBe(ChatSessionStatus.Active)
      expect(reloaded.inboxState).toBeNull()
    })
  })

  describe('handleParentMessage - low confidence escalation', () => {
    it('escalates, creates notifications, and emits websocket events', async () => {
      const school = await buildSchool(0.8)
      await staffRepo.save({
        schoolId: school.id,
        email: 'staff@acme.com',
        passwordHash: 'x',
        fullName: 'Staff One',
        role: StaffRole.Admin,
      })
      aiGenerateResponse.mockResolvedValue({
        answer: "I'm not sure about that.",
        modelConfidence: 0.2,
      })

      const session = await service.createSession(school.id, 'Parent Name')
      const result = await service.handleParentMessage(
        session.sessionToken,
        'do you do overnight care?',
      )

      expect(result.escalated).toBe(true)
      expect(result.aiMessage.content).toContain('flagged')
      expect(result.aiMessage.certaintyScore).toBeLessThan(0.8)

      const reloaded = await sessionRepo.findOneOrFail({ where: { id: session.id } })
      expect(reloaded.status).toBe(ChatSessionStatus.Escalated)
      expect(reloaded.inboxState).toBe(InboxState.NeedsAttention)
      expect(reloaded.escalatedAt).not.toBeNull()

      expect(emitEscalation).toHaveBeenCalledTimes(1)
      const event = emitEscalation.mock.calls[0][0]
      expect(event.schoolId).toBe(school.id)
      expect(event.parentName).toBe('Parent Name')
    })

    it('only escalates once — second low-confidence message does not re-emit escalation', async () => {
      const school = await buildSchool(0.8)
      aiGenerateResponse.mockResolvedValue({
        answer: "I'm not sure.",
        modelConfidence: 0.2,
      })
      const session = await service.createSession(school.id)

      await service.handleParentMessage(session.sessionToken, 'first')
      await service.handleParentMessage(session.sessionToken, 'second')

      expect(emitEscalation).toHaveBeenCalledTimes(1)
    })

    it('persists AI message as escalation trigger when escalated', async () => {
      const school = await buildSchool(0.8)
      aiGenerateResponse.mockResolvedValue({
        answer: 'unclear',
        modelConfidence: 0.1,
      })
      const session = await service.createSession(school.id)
      await service.handleParentMessage(session.sessionToken, 'q')

      const aiMessage = await messageRepo.findOneOrFail({
        where: { chatSessionId: session.id, role: MessageRole.Ai },
      })
      expect(aiMessage.isEscalationTrigger).toBe(true)
    })
  })

  describe('listConversationsForSchool', () => {
    it('returns only escalated/resolved conversations when no filter is provided', async () => {
      const school = await buildSchool(0.8)
      aiGenerateResponse.mockResolvedValue({
        answer: 'unclear',
        modelConfidence: 0.1,
      })

      const escalatedSession = await service.createSession(school.id)
      await service.handleParentMessage(escalatedSession.sessionToken, 'help')

      const activeSession = await sessionRepo.save({
        schoolId: school.id,
        sessionToken: 'active-token',
        status: ChatSessionStatus.Active,
      })

      const results = await service.listConversationsForSchool(school.id)

      expect(results.map((r) => r.id)).toEqual([escalatedSession.id])
      expect(results.map((r) => r.id)).not.toContain(activeSession.id)
    })

    it('filters by inboxState when provided', async () => {
      const school = await buildSchool(0.8)
      await sessionRepo.save([
        {
          schoolId: school.id,
          sessionToken: 'resolved-token',
          status: ChatSessionStatus.Resolved,
          inboxState: InboxState.Resolved,
        },
        {
          schoolId: school.id,
          sessionToken: 'needs-token',
          status: ChatSessionStatus.Escalated,
          inboxState: InboxState.NeedsAttention,
        },
      ])

      const results = await service.listConversationsForSchool(
        school.id,
        InboxState.Resolved,
      )

      expect(results).toHaveLength(1)
      expect(results[0].inboxState).toBe(InboxState.Resolved)
    })
  })

  describe('getConversationForStaff', () => {
    it('returns session + messages for matching school', async () => {
      const school = await buildSchool(0.8)
      const staff = await staffRepo.save({
        schoolId: school.id,
        email: 's@acme.com',
        passwordHash: 'x',
        fullName: 'Staff',
        role: StaffRole.Admin,
      })
      aiGenerateResponse.mockResolvedValue({
        answer: 'unclear',
        modelConfidence: 0.1,
      })
      const session = await service.createSession(school.id)
      await service.handleParentMessage(session.sessionToken, 'help')

      const result = await service.getConversationForStaff(session.id, {
        sub: staff.id,
        schoolId: school.id,
      })

      expect(result.session.id).toBe(session.id)
      expect(result.messages.length).toBe(2)
      expect(result.messages[0].role).toBe(MessageRole.Parent)
      expect(result.messages[1].role).toBe(MessageRole.Ai)
    })

    it('throws ForbiddenException if staff is from a different school', async () => {
      const schoolA = await buildSchool()
      const schoolB = await schoolRepo.save({
        name: 'Other',
        slug: 'other',
        isActive: true,
      })
      const session = await service.createSession(schoolA.id)

      await expect(
        service.getConversationForStaff(session.id, {
          sub: 'any',
          schoolId: schoolB.id,
        }),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('postStaffReply', () => {
    it('saves the staff message and moves session to in_progress', async () => {
      const school = await buildSchool(0.8)
      const staff = await staffRepo.save({
        schoolId: school.id,
        email: 's@acme.com',
        passwordHash: 'x',
        fullName: 'Jordan',
        role: StaffRole.Admin,
      })
      aiGenerateResponse.mockResolvedValue({
        answer: 'unclear',
        modelConfidence: 0.1,
      })
      const session = await service.createSession(school.id)
      await service.handleParentMessage(session.sessionToken, 'help')

      const reply = await service.postStaffReply(
        session.id,
        { sub: staff.id, schoolId: school.id },
        'Hi there — happy to help!',
      )

      expect(reply.content).toBe('Hi there — happy to help!')
      expect(reply.sentByStaffName).toBe('Jordan')

      const reloaded = await sessionRepo.findOneOrFail({
        where: { id: session.id },
      })
      expect(reloaded.inboxState).toBe(InboxState.InProgress)
      expect(reloaded.assignedStaffId).toBe(staff.id)
    })
  })

  describe('updateInboxState', () => {
    it('marks a conversation as resolved with resolvedAt', async () => {
      const school = await buildSchool()
      const staff = await staffRepo.save({
        schoolId: school.id,
        email: 's@acme.com',
        passwordHash: 'x',
        fullName: 'Staff',
        role: StaffRole.Admin,
      })
      const session = await sessionRepo.save({
        schoolId: school.id,
        sessionToken: 'x-token',
        status: ChatSessionStatus.Escalated,
        inboxState: InboxState.InProgress,
      })

      const result = await service.updateInboxState(
        session.id,
        { sub: staff.id, schoolId: school.id },
        InboxState.Resolved,
      )

      expect(result.inboxState).toBe(InboxState.Resolved)
      expect(result.resolvedAt).not.toBeNull()
    })
  })
})

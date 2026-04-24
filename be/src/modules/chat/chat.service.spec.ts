import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ChatService } from './chat.service'
import { ChatSession } from './entities/chat-session.entity'
import { ChatSessionStatus, InboxState } from '@brightwheel/shared'

const makeSession = (overrides: Partial<ChatSession> = {}): ChatSession =>
  ({
    id: 'session-1',
    schoolId: 'school-1',
    parentName: 'Alice',
    parentEmail: 'alice@example.com',
    sessionToken: 'tok-1',
    status: ChatSessionStatus.Active,
    inboxState: null,
    assignedStaffId: null,
    assignedStaff: null,
    escalatedAt: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    school: null as any,
    ...overrides,
  }) as ChatSession

describe('ChatService', () => {
  let service: ChatService
  let repo: { find: jest.Mock }

  beforeEach(async () => {
    repo = { find: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(ChatSession), useValue: repo },
      ],
    }).compile()

    service = module.get<ChatService>(ChatService)
  })

  describe('findLiveBySchool', () => {
    it('queries active and escalated sessions for the school', async () => {
      const sessions = [
        makeSession({ status: ChatSessionStatus.Active }),
        makeSession({
          id: 'session-2',
          status: ChatSessionStatus.Escalated,
          inboxState: InboxState.NeedsAttention,
          escalatedAt: new Date(),
        }),
      ]
      repo.find.mockResolvedValue(sessions)

      const result = await service.findLiveBySchool('school-1')

      expect(result).toEqual(sessions)
      expect(repo.find).toHaveBeenCalledWith({
        where: [
          { schoolId: 'school-1', status: ChatSessionStatus.Active },
          { schoolId: 'school-1', status: ChatSessionStatus.Escalated },
        ],
        relations: ['assignedStaff'],
        order: { escalatedAt: 'DESC', createdAt: 'DESC' },
      })
    })

    it('returns empty array when no live sessions exist', async () => {
      repo.find.mockResolvedValue([])
      const result = await service.findLiveBySchool('school-1')
      expect(result).toEqual([])
    })
  })
})

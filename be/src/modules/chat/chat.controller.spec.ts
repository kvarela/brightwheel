import { INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import { KnowledgeBaseSource } from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { AiService } from '../ai/ai.service'
import { KnowledgeBaseEntry } from '../knowledge-base/entities/knowledge-base-entry.entity'
import { NotificationGateway } from '../notification/notification.gateway'
import { School } from '../school/entities/school.entity'

describe('ChatController (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let schoolRepo: Repository<School>
  let kbRepo: Repository<KnowledgeBaseEntry>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    schoolRepo = app.get(getRepositoryToken(School))
    kbRepo = app.get(getRepositoryToken(KnowledgeBaseEntry))

    const aiService = app.get(AiService)
    jest.spyOn(aiService, 'generateEmbedding').mockResolvedValue(null)
    jest.spyOn(aiService, 'generateResponse').mockResolvedValue({
      answer: 'Open 7am to 6pm.',
      modelConfidence: 0.95,
    })

    const gateway = app.get(NotificationGateway)
    jest.spyOn(gateway, 'emitEscalation').mockImplementation()
    jest.spyOn(gateway, 'emitNewParentMessage').mockImplementation()
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
  })

  it('creates a session without auth and returns a sessionToken', async () => {
    const school = await schoolRepo.save({
      name: 'Acme',
      slug: 'acme',
      isActive: true,
    })

    const response = await request(app.getHttpServer())
      .post('/api/chat/sessions')
      .send({ schoolId: school.id, parentName: 'Alex' })
      .expect(201)

    expect(response.body.sessionToken).toBeDefined()
    expect(response.body.chatSessionId).toBeDefined()
  })

  it('sends a parent message and returns both messages', async () => {
    const school = await schoolRepo.save({
      name: 'Acme',
      slug: 'acme',
      isActive: true,
      escalationThreshold: 0.5,
    })
    await kbRepo.save({
      schoolId: school.id,
      question: 'What are your hours?',
      answer: 'Open 7am to 6pm.',
      source: KnowledgeBaseSource.Manual,
    })

    const sessionRes = await request(app.getHttpServer())
      .post('/api/chat/sessions')
      .send({ schoolId: school.id })
      .expect(201)
    const { sessionToken } = sessionRes.body

    const response = await request(app.getHttpServer())
      .post(`/api/chat/sessions/${sessionToken}/messages`)
      .send({ content: 'what are your hours' })
      .expect(201)

    expect(response.body.parentMessage.content).toBe('what are your hours')
    expect(response.body.aiMessage.content).toBe('Open 7am to 6pm.')
    expect(response.body.escalated).toBe(false)
  })

  it('rejects unauthenticated staff endpoints', async () => {
    await request(app.getHttpServer()).get('/api/chat/conversations').expect(401)
  })
})

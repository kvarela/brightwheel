import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as request from 'supertest'
import {
  ChatSessionStatus,
  NotificationType,
  StaffRole,
} from '@brightwheel/shared'
import { createTestApp } from '../../../test/helpers/app.helper'
import { truncateAll } from '../../../test/helpers/db.helper'
import { ChatSession } from '../chat/entities/chat-session.entity'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { Notification } from './entities/notification.entity'

describe('NotificationController (HTTP)', () => {
  let app: INestApplication
  let db: DataSource
  let jwtService: JwtService
  let schoolRepo: Repository<School>
  let staffRepo: Repository<StaffUser>
  let sessionRepo: Repository<ChatSession>
  let notificationRepo: Repository<Notification>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    jwtService = app.get(JwtService)
    schoolRepo = app.get(getRepositoryToken(School))
    staffRepo = app.get(getRepositoryToken(StaffUser))
    sessionRepo = app.get(getRepositoryToken(ChatSession))
    notificationRepo = app.get(getRepositoryToken(Notification))
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await truncateAll(db)
  })

  async function setupWithToken() {
    const school = await schoolRepo.save({
      name: 'Acme',
      slug: 'acme',
      isActive: true,
    })
    const staff = await staffRepo.save({
      schoolId: school.id,
      email: 's@acme.com',
      passwordHash: 'x',
      fullName: 'Staff',
      role: StaffRole.Admin,
    })
    const session = await sessionRepo.save({
      schoolId: school.id,
      sessionToken: 'tok',
      status: ChatSessionStatus.Active,
    })
    const token = jwtService.sign({
      sub: staff.id,
      email: staff.email,
      schoolId: school.id,
      role: StaffRole.Admin,
    })
    return { school, staff, session, token }
  }

  it('returns unread count for the authenticated staff user', async () => {
    const { staff, session, token } = await setupWithToken()
    await notificationRepo.save([
      {
        staffUserId: staff.id,
        chatSessionId: session.id,
        type: NotificationType.Escalation,
      },
      {
        staffUserId: staff.id,
        chatSessionId: session.id,
        type: NotificationType.Escalation,
      },
    ])

    const response = await request(app.getHttpServer())
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(response.body.unreadCount).toBe(2)
  })

  it('rejects requests without a JWT', async () => {
    await request(app.getHttpServer())
      .get('/api/notifications/unread-count')
      .expect(401)
  })

  it('marks all unread notifications as read', async () => {
    const { staff, session, token } = await setupWithToken()
    await notificationRepo.save({
      staffUserId: staff.id,
      chatSessionId: session.id,
      type: NotificationType.Escalation,
    })

    await request(app.getHttpServer())
      .post('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const count = await notificationRepo.count({
      where: { staffUserId: staff.id, isRead: false },
    })
    expect(count).toBe(0)
  })
})

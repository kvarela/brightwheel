import { INestApplication } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
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
import { NotificationService } from './notification.service'

describe('NotificationService', () => {
  let app: INestApplication
  let db: DataSource
  let service: NotificationService
  let schoolRepo: Repository<School>
  let staffRepo: Repository<StaffUser>
  let sessionRepo: Repository<ChatSession>
  let notificationRepo: Repository<Notification>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    db = testApp.db
    service = app.get(NotificationService)
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

  async function setup() {
    const school = await schoolRepo.save({
      name: 'Acme',
      slug: 'acme',
      isActive: true,
    })
    const staffA = await staffRepo.save({
      schoolId: school.id,
      email: 'a@acme.com',
      passwordHash: 'x',
      fullName: 'Staff A',
      role: StaffRole.Admin,
    })
    const staffB = await staffRepo.save({
      schoolId: school.id,
      email: 'b@acme.com',
      passwordHash: 'x',
      fullName: 'Staff B',
      role: StaffRole.Staff,
    })
    const session = await sessionRepo.save({
      schoolId: school.id,
      sessionToken: 'token-1',
      status: ChatSessionStatus.Active,
    })
    return { school, staffA, staffB, session }
  }

  describe('createEscalationForSchool', () => {
    it('creates one notification per active staff member', async () => {
      const { school, session } = await setup()
      const result = await service.createEscalationForSchool(school.id, session.id)
      expect(result).toHaveLength(2)
      expect(result.every((n) => n.type === NotificationType.Escalation)).toBe(
        true,
      )
    })

    it('skips inactive staff', async () => {
      const { school, staffA, session } = await setup()
      staffA.isActive = false
      await staffRepo.save(staffA)

      const result = await service.createEscalationForSchool(school.id, session.id)
      expect(result).toHaveLength(1)
    })

    it('returns [] when no staff exist for the school', async () => {
      const school = await schoolRepo.save({
        name: 'Empty',
        slug: 'empty',
        isActive: true,
      })
      const session = await sessionRepo.save({
        schoolId: school.id,
        sessionToken: 'empty-token',
        status: ChatSessionStatus.Active,
      })

      const result = await service.createEscalationForSchool(school.id, session.id)
      expect(result).toEqual([])
    })
  })

  describe('unreadCountForStaff', () => {
    it('returns the number of unread notifications for the given staff', async () => {
      const { school, staffA, session } = await setup()
      await service.createEscalationForSchool(school.id, session.id)
      const count = await service.unreadCountForStaff(staffA.id)
      expect(count).toBe(1)
    })

    it('does not count read notifications', async () => {
      const { school, staffA, session } = await setup()
      await service.createEscalationForSchool(school.id, session.id)
      await notificationRepo.update(
        { staffUserId: staffA.id },
        { isRead: true, readAt: new Date() },
      )
      const count = await service.unreadCountForStaff(staffA.id)
      expect(count).toBe(0)
    })
  })

  describe('markAllReadForSession', () => {
    it('marks all unread notifications for a session as read', async () => {
      const { school, staffA, session } = await setup()
      await service.createEscalationForSchool(school.id, session.id)

      await service.markAllReadForSession(staffA.id, session.id)

      const unread = await service.unreadCountForStaff(staffA.id)
      expect(unread).toBe(0)
    })
  })

  describe('markAllReadForStaff', () => {
    it('marks all notifications for a staff user as read', async () => {
      const { school, staffA, session } = await setup()
      await service.createEscalationForSchool(school.id, session.id)

      await service.markAllReadForStaff(staffA.id)

      const unread = await service.unreadCountForStaff(staffA.id)
      expect(unread).toBe(0)
    })
  })
})

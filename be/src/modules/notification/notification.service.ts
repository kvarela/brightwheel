import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NotificationType } from '@brightwheel/shared'
import { Notification } from './entities/notification.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(StaffUser)
    private readonly staffUserRepository: Repository<StaffUser>,
  ) {}

  async createEscalationForSchool(
    schoolId: string,
    chatSessionId: string,
  ): Promise<Notification[]> {
    const staff = await this.staffUserRepository.find({
      where: { schoolId, isActive: true },
      select: ['id'],
    })
    if (staff.length === 0) return []

    const created = staff.map((s) =>
      this.notificationRepository.create({
        staffUserId: s.id,
        chatSessionId,
        type: NotificationType.Escalation,
        isRead: false,
      }),
    )
    return this.notificationRepository.save(created)
  }

  async unreadCountForStaff(staffUserId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { staffUserId, isRead: false },
    })
  }

  async markAllReadForSession(
    staffUserId: string,
    chatSessionId: string,
  ): Promise<void> {
    await this.notificationRepository.update(
      { staffUserId, chatSessionId, isRead: false },
      { isRead: true, readAt: new Date() },
    )
  }

  async markAllReadForStaff(staffUserId: string): Promise<void> {
    await this.notificationRepository.update(
      { staffUserId, isRead: false },
      { isRead: true, readAt: new Date() },
    )
  }
}

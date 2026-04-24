import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { RequestUser } from '../auth/strategies/jwt.strategy'
import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('unread-count')
  async unreadCount(
    @Req() req: Request,
  ): Promise<{ unreadCount: number }> {
    const user = req.user as RequestUser
    const count = await this.notificationService.unreadCountForStaff(user.staffUserId)
    return { unreadCount: count }
  }

  @Post('mark-all-read')
  async markAllRead(@Req() req: Request): Promise<{ ok: true }> {
    const user = req.user as RequestUser
    await this.notificationService.markAllReadForStaff(user.staffUserId)
    return { ok: true }
  }
}

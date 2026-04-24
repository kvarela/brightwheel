import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { ChatSession } from '../chat/entities/chat-session.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { Notification } from './entities/notification.entity'
import { NotificationController } from './notification.controller'
import { NotificationGateway } from './notification.gateway'
import { NotificationService } from './notification.service'
import { ParentGateway } from './parent.gateway'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, StaffUser, ChatSession]),
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'fallback-dev-secret',
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, ParentGateway],
  exports: [NotificationService, NotificationGateway, ParentGateway],
})
export class NotificationModule {}

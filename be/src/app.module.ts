import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { getDatabaseConfig } from './config/database.config'
import { SchoolModule } from './modules/school/school.module'
import { StaffUserModule } from './modules/staff-user/staff-user.module'
import { HandbookModule } from './modules/handbook/handbook.module'
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module'
import { ChatModule } from './modules/chat/chat.module'
import { NotificationModule } from './modules/notification/notification.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    SchoolModule,
    StaffUserModule,
    HandbookModule,
    KnowledgeBaseModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

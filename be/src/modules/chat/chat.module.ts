import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiModule } from '../ai/ai.module'
import { AuthModule } from '../auth/auth.module'
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module'
import { NotificationModule } from '../notification/notification.module'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatSession } from './entities/chat-session.entity'
import { Message } from './entities/message.entity'
import { MessageKnowledgeBaseEntry } from './entities/message-knowledge-base-entry.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      Message,
      MessageKnowledgeBaseEntry,
      School,
      StaffUser,
    ]),
    AiModule,
    KnowledgeBaseModule,
    NotificationModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [TypeOrmModule, ChatService],
})
export class ChatModule {}

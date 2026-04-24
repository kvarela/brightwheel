import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatSession } from './entities/chat-session.entity'
import { Message } from './entities/message.entity'
import { MessageKnowledgeBaseEntry } from './entities/message-knowledge-base-entry.entity'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, Message, MessageKnowledgeBaseEntry]),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [TypeOrmModule],
})
export class ChatModule {}

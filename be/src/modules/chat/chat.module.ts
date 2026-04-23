import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatSession } from './entities/chat-session.entity'
import { Message } from './entities/message.entity'
import { MessageKnowledgeBaseEntry } from './entities/message-knowledge-base-entry.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatSession,
      Message,
      MessageKnowledgeBaseEntry,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ChatModule {}

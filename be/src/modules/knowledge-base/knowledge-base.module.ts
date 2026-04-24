import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiModule } from '../ai/ai.module'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { KnowledgeBaseService } from './knowledge-base.service'
import { KnowledgeBaseController } from './knowledge-base.controller'

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBaseEntry]), AiModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [TypeOrmModule, KnowledgeBaseService],
})
export class KnowledgeBaseModule {}

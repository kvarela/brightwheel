import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiModule } from '../ai/ai.module'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { KnowledgeBaseService } from './knowledge-base.service'

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBaseEntry]), AiModule],
  providers: [KnowledgeBaseService],
  exports: [TypeOrmModule, KnowledgeBaseService],
})
export class KnowledgeBaseModule {}

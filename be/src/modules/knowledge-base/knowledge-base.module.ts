import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBaseEntry])],
  exports: [TypeOrmModule],
})
export class KnowledgeBaseModule {}

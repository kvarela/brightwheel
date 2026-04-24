import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KnowledgeBaseEntry } from './entities/knowledge-base-entry.entity'
import { KnowledgeBaseService } from './knowledge-base.service'
import { KnowledgeBaseController } from './knowledge-base.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBaseEntry]), AuthModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [TypeOrmModule],
})
export class KnowledgeBaseModule {}

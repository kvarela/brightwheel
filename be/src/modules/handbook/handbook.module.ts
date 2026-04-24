import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'
import { KnowledgeBaseEntry } from '../knowledge-base/entities/knowledge-base-entry.entity'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { HandbookController } from './handbook.controller'
import { HandbookUploadService } from './services/handbook-upload.service'
import { HandbookRequestContextService } from './services/handbook-request-context.service'
import { ObjectStorageService } from './services/object-storage.service'
import { HandbookTextExtractorService } from './services/handbook-text-extractor.service'
import { HandbookParserService } from './services/handbook-parser.service'
import { AuthModule } from '../auth/auth.module'
import { HandbookService } from './handbook.service'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      HandbookUpload,
      HandbookVersion,
      HandbookDiffEntry,
      KnowledgeBaseEntry,
      School,
      StaffUser,
    ]),
    AuthModule,
  ],
  controllers: [HandbookController],
  providers: [
    HandbookUploadService,
    HandbookRequestContextService,
    ObjectStorageService,
    HandbookTextExtractorService,
    HandbookParserService,
    HandbookService,
  ],
  exports: [TypeOrmModule],
})
export class HandbookModule {}

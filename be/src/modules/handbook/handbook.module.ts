import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'
import { HandbookService } from './handbook.service'
import { HandbookController } from './handbook.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([HandbookUpload, HandbookVersion, HandbookDiffEntry]),
    AuthModule,
  ],
  controllers: [HandbookController],
  providers: [HandbookService],
  exports: [TypeOrmModule],
})
export class HandbookModule {}

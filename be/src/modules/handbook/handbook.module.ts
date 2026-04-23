import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HandbookUpload } from './entities/handbook-upload.entity'
import { HandbookVersion } from './entities/handbook-version.entity'
import { HandbookDiffEntry } from './entities/handbook-diff-entry.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HandbookUpload,
      HandbookVersion,
      HandbookDiffEntry,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class HandbookModule {}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import {
  ExtractionConfidence,
  HandbookDiffChangeType,
  HandbookDiffStatus,
} from '@brightwheel/shared'
import { HandbookVersion } from './handbook-version.entity'
import { KnowledgeBaseEntry } from '../../knowledge-base/entities/knowledge-base-entry.entity'

@Entity('handbook_diff_entry')
export class HandbookDiffEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  handbookVersionId: string

  @ManyToOne(() => HandbookVersion, { nullable: false })
  @JoinColumn({ name: 'handbookVersionId' })
  handbookVersion: HandbookVersion

  @Column({ nullable: true })
  knowledgeBaseEntryId: string | null

  // null means this is a proposed addition (no existing entry to update/delete)
  @ManyToOne(() => KnowledgeBaseEntry, { nullable: true })
  @JoinColumn({ name: 'knowledgeBaseEntryId' })
  knowledgeBaseEntry: KnowledgeBaseEntry | null

  @Column({ type: 'enum', enum: HandbookDiffChangeType })
  changeType: HandbookDiffChangeType

  @Column({ type: 'text' })
  proposedQuestion: string

  @Column({ type: 'text' })
  proposedAnswer: string

  @Column({ type: 'text', nullable: true })
  sourceExcerpt: string | null

  @Column({ type: 'enum', enum: ExtractionConfidence, nullable: true })
  extractionConfidence: ExtractionConfidence | null

  @Column({
    type: 'enum',
    enum: HandbookDiffStatus,
    default: HandbookDiffStatus.Pending,
  })
  status: HandbookDiffStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

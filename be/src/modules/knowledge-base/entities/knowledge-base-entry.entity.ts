import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BaseInquiryKey, KnowledgeBaseSource } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { HandbookVersion } from '../../handbook/entities/handbook-version.entity'

@Entity('knowledge_base_entry')
export class KnowledgeBaseEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  schoolId: string

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column({ type: 'text' })
  question: string

  @Column({ type: 'text' })
  answer: string

  // text-embedding-3-small produces 1536-dim vectors; cast to ::vector for pgvector similarity search
  @Column('real', { array: true, nullable: true })
  embedding: number[] | null

  @Column({ default: false })
  isBaseInquiry: boolean

  @Column({ type: 'enum', enum: BaseInquiryKey, nullable: true })
  baseInquiryKey: BaseInquiryKey | null

  @Column({ type: 'enum', enum: KnowledgeBaseSource })
  source: KnowledgeBaseSource

  @Column({ type: 'varchar', nullable: true })
  handbookVersionId: string | null

  @ManyToOne(() => HandbookVersion, { nullable: true })
  @JoinColumn({ name: 'handbookVersionId' })
  handbookVersion: HandbookVersion | null

  // Set when this entry was auto-created from a staff reply to an escalated chat session.
  // One KB entry per session; acts as dedupe + provenance.
  @Index({ unique: true, where: '"sourceChatSessionId" IS NOT NULL' })
  @Column({ type: 'uuid', nullable: true })
  sourceChatSessionId: string | null

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

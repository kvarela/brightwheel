import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BaseInquiryKey, KnowledgeBaseSource } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { HandbookVersion } from '../../handbook/entities/handbook-version.entity'

@Entity('knowledge_base_entries')
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

  @Column({ nullable: true })
  handbookVersionId: string | null

  @ManyToOne(() => HandbookVersion, { nullable: true })
  @JoinColumn({ name: 'handbookVersionId' })
  handbookVersion: HandbookVersion | null

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

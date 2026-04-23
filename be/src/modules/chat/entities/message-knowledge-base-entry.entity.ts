import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Message } from './message.entity'
import { KnowledgeBaseEntry } from '../../knowledge-base/entities/knowledge-base-entry.entity'

@Entity('message_knowledge_base_entries')
export class MessageKnowledgeBaseEntry {
  @PrimaryColumn()
  messageId: string

  @ManyToOne(() => Message, { nullable: false })
  @JoinColumn({ name: 'messageId' })
  message: Message

  @PrimaryColumn()
  knowledgeBaseEntryId: string

  @ManyToOne(() => KnowledgeBaseEntry, { nullable: false })
  @JoinColumn({ name: 'knowledgeBaseEntryId' })
  knowledgeBaseEntry: KnowledgeBaseEntry

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  similarityScore: number
}

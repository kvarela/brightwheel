import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { MessageRole } from '@brightwheel/shared'
import { ChatSession } from './chat-session.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  chatSessionId: string

  @ManyToOne(() => ChatSession, { nullable: false })
  @JoinColumn({ name: 'chatSessionId' })
  chatSession: ChatSession

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole

  @Column({ type: 'text' })
  content: string

  // Only populated for AI messages; used for escalation routing
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  certaintyScore: number | null

  @Column({ default: false })
  isEscalationTrigger: boolean

  @Column({ nullable: true })
  sentByStaffId: string | null

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'sentByStaffId' })
  sentByStaff: StaffUser | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}

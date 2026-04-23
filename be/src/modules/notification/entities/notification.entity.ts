import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { NotificationType } from '@brightwheel/shared'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'
import { ChatSession } from '../../chat/entities/chat-session.entity'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  staffUserId: string

  @ManyToOne(() => StaffUser, { nullable: false })
  @JoinColumn({ name: 'staffUserId' })
  staffUser: StaffUser

  @Column()
  chatSessionId: string

  @ManyToOne(() => ChatSession, { nullable: false })
  @JoinColumn({ name: 'chatSessionId' })
  chatSession: ChatSession

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType

  @Column({ default: false })
  isRead: boolean

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}

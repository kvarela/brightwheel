import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { ChatSessionStatus, InboxState } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'

@Entity('chat_session')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  schoolId: string

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column({ nullable: true })
  parentName: string | null

  @Column({ nullable: true })
  parentEmail: string | null

  @Column({ unique: true })
  sessionToken: string

  @Column({
    type: 'enum',
    enum: ChatSessionStatus,
    default: ChatSessionStatus.Active,
  })
  status: ChatSessionStatus

  // Only set when the session has been escalated
  @Column({ type: 'enum', enum: InboxState, nullable: true })
  inboxState: InboxState | null

  @Column({ nullable: true })
  assignedStaffId: string | null

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'assignedStaffId' })
  assignedStaff: StaffUser | null

  @Column({ type: 'timestamptz', nullable: true })
  escalatedAt: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

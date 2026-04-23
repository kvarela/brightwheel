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
import { StaffRole } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'

@Entity('staff_users')
@Index(['schoolId', 'email'], { unique: true })
export class StaffUser {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  schoolId: string

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  email: string

  @Column()
  passwordHash: string

  @Column()
  fullName: string

  @Column({ type: 'enum', enum: StaffRole })
  role: StaffRole

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

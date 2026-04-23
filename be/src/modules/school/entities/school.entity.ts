import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.8 })
  escalationThreshold: number

  @Column({ default: false })
  isActive: boolean

  @Column({ type: 'timestamptz', nullable: true })
  onboardingCompletedAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

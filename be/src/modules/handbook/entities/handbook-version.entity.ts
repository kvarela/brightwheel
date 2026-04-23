import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { HandbookVersionStatus } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'
import { HandbookUpload } from './handbook-upload.entity'

@Entity('handbook_version')
export class HandbookVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  schoolId: string

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  uploadId: string

  @OneToOne(() => HandbookUpload, { nullable: false })
  @JoinColumn({ name: 'uploadId' })
  upload: HandbookUpload

  @Column()
  versionNumber: number

  @Column({
    type: 'enum',
    enum: HandbookVersionStatus,
    default: HandbookVersionStatus.PendingReview,
  })
  status: HandbookVersionStatus

  @Column({ nullable: true })
  reviewedById: string | null

  @ManyToOne(() => StaffUser, { nullable: true })
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy: StaffUser | null

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { HandbookFileType, HandbookUploadStatus } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'

@Entity('handbook_upload')
export class HandbookUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  schoolId: string

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'schoolId' })
  school: School

  @Column()
  fileKey: string

  @Column()
  fileName: string

  @Column({ type: 'enum', enum: HandbookFileType })
  fileType: HandbookFileType

  @Column({
    type: 'enum',
    enum: HandbookUploadStatus,
    default: HandbookUploadStatus.Pending,
  })
  status: HandbookUploadStatus

  @Column()
  uploadedById: string

  @ManyToOne(() => StaffUser, { nullable: false })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: StaffUser

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}

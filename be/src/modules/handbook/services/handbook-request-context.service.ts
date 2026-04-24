import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StaffRole } from '@brightwheel/shared'
import { School } from '../../school/entities/school.entity'
import { StaffUser } from '../../staff-user/entities/staff-user.entity'

const SYSTEM_STAFF_EMAIL = 'system@brightwheel.local'

export interface HandbookRequestContext {
  schoolId: string
  staffUserId: string
}

/**
 * Provides the school + staff identifiers for handbook operations before auth is wired up.
 * When a header is absent, falls back to the sole seeded school and an auto-created system staff user.
 */
@Injectable()
export class HandbookRequestContextService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
    @InjectRepository(StaffUser)
    private readonly staffUserRepository: Repository<StaffUser>,
  ) {}

  async resolve(
    headerSchoolId?: string,
    headerStaffUserId?: string,
  ): Promise<HandbookRequestContext> {
    const schoolId = headerSchoolId
      ? await this.verifySchool(headerSchoolId)
      : await this.defaultSchoolId()
    const staffUserId = headerStaffUserId
      ? await this.verifyStaffUser(headerStaffUserId, schoolId)
      : await this.defaultStaffUserId(schoolId)
    return { schoolId, staffUserId }
  }

  private async verifySchool(schoolId: string): Promise<string> {
    const school = await this.schoolRepository.findOne({ where: { id: schoolId } })
    if (!school) throw new NotFoundException(`School ${schoolId} not found`)
    return school.id
  }

  private async verifyStaffUser(staffUserId: string, schoolId: string): Promise<string> {
    const staff = await this.staffUserRepository.findOne({
      where: { id: staffUserId, schoolId },
    })
    if (!staff) throw new NotFoundException(`Staff user ${staffUserId} not found`)
    return staff.id
  }

  private async defaultSchoolId(): Promise<string> {
    const school = await this.schoolRepository
      .createQueryBuilder('school')
      .orderBy('school.createdAt', 'ASC')
      .getOne()
    if (!school) throw new NotFoundException('No schools exist in the database')
    return school.id
  }

  private async defaultStaffUserId(schoolId: string): Promise<string> {
    const existing = await this.staffUserRepository.findOne({
      where: { schoolId, email: SYSTEM_STAFF_EMAIL },
    })
    if (existing) return existing.id

    const created = await this.staffUserRepository.save(
      this.staffUserRepository.create({
        schoolId,
        email: SYSTEM_STAFF_EMAIL,
        passwordHash: 'disabled',
        fullName: 'System',
        role: StaffRole.Admin,
        isActive: true,
      }),
    )
    return created.id
  }
}

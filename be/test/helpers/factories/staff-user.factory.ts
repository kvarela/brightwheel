import { DataSource } from 'typeorm'
import { StaffRole } from '@brightwheel/shared'
import { StaffUser } from '../../../src/modules/staff-user/entities/staff-user.entity'

let counter = 0

export async function createTestStaffUser(
  db: DataSource,
  schoolId: string,
  overrides: Partial<StaffUser> = {},
): Promise<StaffUser> {
  counter += 1
  const repo = db.getRepository(StaffUser)
  const staff = repo.create({
    schoolId,
    email: overrides.email ?? `staff-${counter}-${Date.now()}@test.local`,
    passwordHash: overrides.passwordHash ?? 'hash',
    fullName: overrides.fullName ?? `Staff ${counter}`,
    role: overrides.role ?? StaffRole.Admin,
    isActive: overrides.isActive ?? true,
  })
  return repo.save(staff)
}

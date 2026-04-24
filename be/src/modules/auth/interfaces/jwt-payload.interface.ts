import { StaffRole } from '@brightwheel/shared'

export interface JwtPayload {
  sub: string
  email: string
  schoolId: string
  role: StaffRole
}

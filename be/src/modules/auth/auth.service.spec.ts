import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { AuthService } from './auth.service'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { StaffRole } from '@brightwheel/shared'

const mockStaffUser: StaffUser = {
  id: 'staff-1',
  schoolId: 'school-1',
  email: 'staff@school.com',
  passwordHash: bcrypt.hashSync('password123', 10),
  fullName: 'Jane Smith',
  role: StaffRole.Staff,
  isActive: true,
  lastSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  school: null as any,
}

describe('AuthService', () => {
  let service: AuthService
  let staffUserRepo: { findOne: jest.Mock }
  let jwtService: { sign: jest.Mock }

  beforeEach(async () => {
    staffUserRepo = { findOne: jest.fn() }
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(StaffUser), useValue: staffUserRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  describe('login', () => {
    it('returns access token and staff user on valid credentials', async () => {
      staffUserRepo.findOne.mockResolvedValue(mockStaffUser)

      const result = await service.login(
        { email: 'staff@school.com', password: 'password123' },
        'school-1',
      )

      expect(result.accessToken).toBe('signed-token')
      expect(result.staffUser.email).toBe('staff@school.com')
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'staff-1',
        schoolId: 'school-1',
        role: StaffRole.Staff,
      })
    })

    it('throws UnauthorizedException when staff user not found', async () => {
      staffUserRepo.findOne.mockResolvedValue(null)

      await expect(
        service.login({ email: 'nobody@school.com', password: 'pass' }, 'school-1'),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('throws UnauthorizedException when password is wrong', async () => {
      staffUserRepo.findOne.mockResolvedValue(mockStaffUser)

      await expect(
        service.login({ email: 'staff@school.com', password: 'wrong' }, 'school-1'),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})

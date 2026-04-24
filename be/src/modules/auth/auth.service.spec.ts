import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { Repository } from 'typeorm'
import { StaffRole } from '@brightwheel/shared'
import { getDatabaseConfig } from '../../config/database.config'
import { School } from '../school/entities/school.entity'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let module: TestingModule
  let service: AuthService
  let staffUserRepo: Repository<StaffUser>
  let schoolRepo: Repository<School>
  let testSchool: School

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getDatabaseConfig()),
        TypeOrmModule.forFeature([StaffUser, School]),
        JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } }),
      ],
      providers: [AuthService],
    }).compile()

    service = module.get<AuthService>(AuthService)
    staffUserRepo = module.get<Repository<StaffUser>>(getRepositoryToken(StaffUser))
    schoolRepo = module.get<Repository<School>>(getRepositoryToken(School))

    testSchool = await schoolRepo.save({ name: 'Test School', slug: 'test-school' })
  }, 30000)

  afterAll(async () => {
    await module.close()
  })

  describe('login', () => {
    beforeAll(async () => {
      const passwordHash = await bcrypt.hash('correct-pass', 10)
      await staffUserRepo.save({
        schoolId: testSchool.id,
        email: 'login@example.com',
        passwordHash,
        fullName: 'Login User',
        role: StaffRole.Admin,
      })
    }, 15000)

    it('returns an access token for valid credentials', async () => {
      const result = await service.login('login@example.com', 'correct-pass')
      expect(result.accessToken).toBeDefined()
      expect(typeof result.accessToken).toBe('string')
    })

    it('throws UnauthorizedException for wrong password', async () => {
      await expect(service.login('login@example.com', 'wrong-pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException for unknown email', async () => {
      await expect(service.login('nobody@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException for inactive user', async () => {
      const hash = await bcrypt.hash('pass', 10)
      await staffUserRepo.save({
        schoolId: testSchool.id,
        email: 'inactive@example.com',
        passwordHash: hash,
        fullName: 'Inactive',
        role: StaffRole.Staff,
        isActive: false,
      })
      await expect(service.login('inactive@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('register', () => {
    it('creates a new school and returns a token when newSchoolName provided', async () => {
      const result = await service.register(
        'New Admin',
        'newadmin@example.com',
        'password123',
        null,
        'Brand New School',
      )
      expect(result.accessToken).toBeDefined()

      const created = await schoolRepo.findOne({ where: { name: 'Brand New School' } })
      expect(created).toBeDefined()
    })

    it('attaches user to existing school when schoolId provided', async () => {
      const result = await service.register(
        'Staff Person',
        'staff@example.com',
        'password123',
        testSchool.id,
        null,
      )
      expect(result.accessToken).toBeDefined()

      const user = await staffUserRepo.findOne({ where: { email: 'staff@example.com' } })
      expect(user?.schoolId).toBe(testSchool.id)
    })

    it('throws ConflictException if email already exists', async () => {
      await expect(
        service.register('Dup', 'login@example.com', 'password123', testSchool.id, null),
      ).rejects.toThrow(ConflictException)
    })

    it('throws NotFoundException if schoolId does not exist', async () => {
      await expect(
        service.register(
          'Nobody',
          'nobody2@example.com',
          'password123',
          '00000000-0000-0000-0000-000000000000',
          null,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })
})

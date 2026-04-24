import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { StaffRole } from '@brightwheel/shared'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { School } from '../school/entities/school.entity'
import type { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(StaffUser)
    private staffUserRepository: Repository<StaffUser>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const staffUser = await this.staffUserRepository.findOne({
      where: { email, isActive: true },
    })

    if (!staffUser) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, staffUser.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return { accessToken: this.sign(staffUser) }
  }

  async register(
    fullName: string,
    email: string,
    password: string,
    schoolId: string | null | undefined,
    newSchoolName: string | null | undefined,
  ): Promise<{ accessToken: string }> {
    const existing = await this.staffUserRepository.findOne({ where: { email } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    let school: School

    if (schoolId) {
      const found = await this.schoolRepository.findOne({ where: { id: schoolId } })
      if (!found) throw new NotFoundException('School not found')
      school = found
    } else if (newSchoolName) {
      const slug = this.toSlug(newSchoolName)
      const uniqueSlug = await this.uniqueSlug(slug)
      school = await this.schoolRepository.save({
        name: newSchoolName,
        slug: uniqueSlug,
      })
    } else {
      throw new ConflictException('Either schoolId or newSchoolName is required')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const staffUser = await this.staffUserRepository.save({
      fullName,
      email,
      passwordHash,
      schoolId: school.id,
      role: StaffRole.Admin,
    })

    return { accessToken: this.sign(staffUser) }
  }

  private sign(staffUser: StaffUser): string {
    const payload: JwtPayload = {
      sub: staffUser.id,
      email: staffUser.email,
      schoolId: staffUser.schoolId,
      role: staffUser.role,
    }
    return this.jwtService.sign(payload)
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base
    let attempt = 0
    while (await this.schoolRepository.findOne({ where: { slug } })) {
      attempt++
      slug = `${base}-${attempt}`
    }
    return slug
  }
}

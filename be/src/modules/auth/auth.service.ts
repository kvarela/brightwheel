import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './strategies/jwt.strategy'

export interface AuthResponse {
  accessToken: string
  staffUser: {
    id: string
    email: string
    fullName: string
    role: string
    schoolId: string
  }
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(StaffUser)
    private readonly staffUserRepo: Repository<StaffUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, schoolId: string): Promise<AuthResponse> {
    const staffUser = await this.staffUserRepo.findOne({
      where: { email: dto.email, schoolId, isActive: true },
    })

    if (!staffUser) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordValid = await bcrypt.compare(dto.password, staffUser.passwordHash)
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = {
      sub: staffUser.id,
      schoolId: staffUser.schoolId,
      role: staffUser.role,
    }

    return {
      accessToken: this.jwtService.sign(payload),
      staffUser: {
        id: staffUser.id,
        email: staffUser.email,
        fullName: staffUser.fullName,
        role: staffUser.role,
        schoolId: staffUser.schoolId,
      },
    }
  }
}

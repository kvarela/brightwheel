import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface JwtPayload {
  sub: string
  schoolId: string
  role: string
}

export interface RequestUser {
  staffUserId: string
  schoolId: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    })
  }

  validate(payload: JwtPayload): RequestUser {
    if (!payload.sub || !payload.schoolId) {
      throw new UnauthorizedException()
    }
    return {
      staffUserId: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
    }
  }
}

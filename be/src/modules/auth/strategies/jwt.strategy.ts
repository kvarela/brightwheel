import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

export { JwtPayload }

export interface RequestUser {
  staffUserId: string
  schoolId: string
  role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'fallback-dev-secret',
    })
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      staffUserId: payload.sub,
      schoolId: payload.schoolId,
      role: payload.role,
    }
  }
}

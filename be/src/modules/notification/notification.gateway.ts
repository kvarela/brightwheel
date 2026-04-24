import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import type {
  EscalationEventDto,
  NewParentMessageEventDto,
} from '@brightwheel/shared'
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface'

function schoolRoom(schoolId: string): string {
  return `school:${schoolId}`
}

@WebSocketGateway({
  namespace: '/ws/staff',
  cors: { origin: true, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection {
  private readonly logger = new Logger(NotificationGateway.name)

  @WebSocketServer()
  server: Server

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket): void {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined)

    if (!token) {
      client.disconnect()
      return
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') ?? 'fallback-dev-secret',
      })
      client.data.staffUserId = payload.sub
      client.data.schoolId = payload.schoolId
      client.join(schoolRoom(payload.schoolId))
    } catch (err) {
      this.logger.warn(`Rejecting ws client: ${(err as Error).message}`)
      client.disconnect()
    }
  }

  emitEscalation(event: EscalationEventDto): void {
    if (!this.server) return
    this.server.to(schoolRoom(event.schoolId)).emit('escalation', event)
  }

  emitNewParentMessage(event: NewParentMessageEventDto): void {
    if (!this.server) return
    this.server.to(schoolRoom(event.schoolId)).emit('parent_message', event)
  }
}

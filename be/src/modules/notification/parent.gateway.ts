import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Repository } from 'typeorm'
import { Server, Socket } from 'socket.io'
import type { StaffReplyEventDto } from '@brightwheel/shared'
import { ChatSession } from '../chat/entities/chat-session.entity'

function sessionRoom(chatSessionId: string): string {
  return `session:${chatSessionId}`
}

@WebSocketGateway({
  namespace: '/ws/parent',
  cors: { origin: true, credentials: true },
})
export class ParentGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ParentGateway.name)

  @WebSocketServer()
  server: Server

  constructor(
    @InjectRepository(ChatSession)
    private readonly sessionRepository: Repository<ChatSession>,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const sessionToken =
      (client.handshake.auth?.sessionToken as string | undefined) ??
      (client.handshake.query?.sessionToken as string | undefined)

    if (!sessionToken) {
      client.disconnect()
      return
    }

    const session = await this.sessionRepository.findOne({
      where: { sessionToken },
    })

    if (!session) {
      this.logger.warn('Parent WS: unknown sessionToken, disconnecting')
      client.disconnect()
      return
    }

    client.data.chatSessionId = session.id
    client.join(sessionRoom(session.id))
  }

  emitStaffReply(event: StaffReplyEventDto): void {
    if (!this.server) return
    this.server.to(sessionRoom(event.chatSessionId)).emit('staff_reply', event)
  }
}

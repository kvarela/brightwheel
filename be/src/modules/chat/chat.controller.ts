import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/auth.guard'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { ChatService } from './chat.service'

@Controller('chat-sessions')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getLive(@Request() req: { user: RequestUser }) {
    return this.chatService.findLiveBySchool(req.user.schoolId)
  }
}

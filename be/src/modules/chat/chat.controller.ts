import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import {
  ChatMessageDto,
  ChatSessionDto,
  CreateChatSessionResponseDto,
  InboxState,
  SendMessageResponseDto,
} from '@brightwheel/shared'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ChatService } from './chat.service'
import { CreateSessionDto } from './dto/create-session.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateStateDto } from './dto/update-state.dto'
import { RequestUser } from '../auth/strategies/jwt.strategy'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getLive(@Request() req: { user: RequestUser }) {
    return this.chatService.findLiveBySchool(req.user.schoolId)
  }

  @Post('sessions')
  async createSession(@Body() dto: CreateSessionDto): Promise<CreateChatSessionResponseDto> {
    const session = await this.chatService.createSession(
      dto.schoolId,
      dto.parentName,
      dto.parentEmail,
    )
    return {
      sessionToken: session.sessionToken,
      chatSessionId: session.id,
    }
  }

  @Post('sessions/:sessionToken/messages')
  async sendMessage(
    @Param('sessionToken') sessionToken: string,
    @Body() dto: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    return this.chatService.handleParentMessage(sessionToken, dto.content)
  }

  @Get('sessions/:sessionToken/messages')
  async listMessages(@Param('sessionToken') sessionToken: string): Promise<ChatMessageDto[]> {
    return this.chatService.listMessages(sessionToken)
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async listConversations(
    @Request() req: { user: RequestUser },
    @Query('inboxState') inboxState?: InboxState,
  ): Promise<ChatSessionDto[]> {
    return this.chatService.listConversationsForSchool(req.user.schoolId, inboxState)
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: RequestUser },
  ): Promise<{ session: ChatSessionDto; messages: ChatMessageDto[] }> {
    return this.chatService.getConversationForStaff(id, {
      sub: req.user.staffUserId,
      schoolId: req.user.schoolId,
    })
  }

  @Post('conversations/:id/replies')
  @UseGuards(JwtAuthGuard)
  async reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Request() req: { user: RequestUser },
  ): Promise<ChatMessageDto> {
    return this.chatService.postStaffReply(
      id,
      { sub: req.user.staffUserId, schoolId: req.user.schoolId },
      dto.content,
    )
  }

  @Patch('conversations/:id/state')
  @UseGuards(JwtAuthGuard)
  async updateState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStateDto,
    @Request() req: { user: RequestUser },
  ): Promise<ChatSessionDto> {
    return this.chatService.updateInboxState(
      id,
      { sub: req.user.staffUserId, schoolId: req.user.schoolId },
      dto.inboxState,
    )
  }
}

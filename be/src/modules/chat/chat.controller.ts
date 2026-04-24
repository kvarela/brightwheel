import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'
import {
  ChatMessageDto,
  ChatSessionDto,
  CreateChatSessionResponseDto,
  InboxState,
  SendMessageResponseDto,
} from '@brightwheel/shared'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { ChatService } from './chat.service'
import { CreateSessionDto } from './dto/create-session.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { UpdateStateDto } from './dto/update-state.dto'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(
    @Body() dto: CreateSessionDto,
  ): Promise<CreateChatSessionResponseDto> {
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
  async listMessages(
    @Param('sessionToken') sessionToken: string,
  ): Promise<ChatMessageDto[]> {
    return this.chatService.listMessages(sessionToken)
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async listConversations(
    @Req() req: Request,
    @Query('inboxState') inboxState?: InboxState,
  ): Promise<ChatSessionDto[]> {
    const user = req.user as JwtPayload
    return this.chatService.listConversationsForSchool(user.schoolId, inboxState)
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<{ session: ChatSessionDto; messages: ChatMessageDto[] }> {
    const user = req.user as JwtPayload
    return this.chatService.getConversationForStaff(id, user)
  }

  @Post('conversations/:id/replies')
  @UseGuards(JwtAuthGuard)
  async reply(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ): Promise<ChatMessageDto> {
    const user = req.user as JwtPayload
    return this.chatService.postStaffReply(id, user, dto.content)
  }

  @Patch('conversations/:id/state')
  @UseGuards(JwtAuthGuard)
  async updateState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStateDto,
    @Req() req: Request,
  ): Promise<ChatSessionDto> {
    const user = req.user as JwtPayload
    return this.chatService.updateInboxState(id, user, dto.inboxState)
  }
}

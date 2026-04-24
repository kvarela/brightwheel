import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import {
  HandbookProcessResponseDto,
  HandbookSignedUploadResponseDto,
  HandbookUploadDetailDto,
} from '@brightwheel/shared'
import { CreateSignedUploadDto } from './dto/create-signed-upload.dto'
import { ProcessHandbookDto } from './dto/process-handbook.dto'
import { HandbookUploadService } from './services/handbook-upload.service'
import { HandbookRequestContextService } from './services/handbook-request-context.service'
import { HandbookService } from './handbook.service'
import { StaffUser } from '../staff-user/entities/staff-user.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

const SCHOOL_HEADER = 'x-school-id'
const STAFF_HEADER = 'x-staff-user-id'

@Controller('handbook')
export class HandbookController {
  constructor(
    private readonly uploadService: HandbookUploadService,
    private readonly contextService: HandbookRequestContextService,
    private readonly handbookService: HandbookService,
  ) {}

  @Post('uploads/signed-url')
  async createSignedUpload(
    @Body() body: CreateSignedUploadDto,
    @Headers(SCHOOL_HEADER) schoolHeader?: string,
    @Headers(STAFF_HEADER) staffHeader?: string,
  ): Promise<HandbookSignedUploadResponseDto> {
    const { schoolId, staffUserId } = await this.contextService.resolve(schoolHeader, staffHeader)
    return this.uploadService.createSignedUpload(schoolId, staffUserId, body)
  }

  @Post('uploads/process')
  async processUpload(@Body() body: ProcessHandbookDto): Promise<HandbookProcessResponseDto> {
    return this.uploadService.processUpload(body.uploadId)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUploads(@Request() req: { user: StaffUser }) {
    return this.handbookService.findBySchool(req.user.schoolId)
  }

  @Get('uploads/:uploadId')
  @UseGuards(JwtAuthGuard)
  getUploadDetail(
    @Request() req: { user: StaffUser },
    @Param('uploadId', new ParseUUIDPipe()) uploadId: string,
  ): Promise<HandbookUploadDetailDto> {
    return this.handbookService.findUploadDetail(req.user.schoolId, uploadId)
  }

  @Delete(':uploadId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUpload(
    @Param('uploadId', new ParseUUIDPipe()) uploadId: string,
    @Request() req: { user: StaffUser },
  ): Promise<void> {
    await this.handbookService.deleteUpload(uploadId, req.user.schoolId)
  }
}

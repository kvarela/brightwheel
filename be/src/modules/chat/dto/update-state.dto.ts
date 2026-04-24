import { IsEnum } from 'class-validator'
import { InboxState } from '@brightwheel/shared'

export class UpdateStateDto {
  @IsEnum(InboxState)
  inboxState: InboxState
}

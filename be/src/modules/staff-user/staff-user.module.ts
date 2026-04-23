import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StaffUser } from './entities/staff-user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([StaffUser])],
  exports: [TypeOrmModule],
})
export class StaffUserModule {}

import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from 'src/admin-auth/admin-auth.module';

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}

import { Module } from '@nestjs/common';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';

@Module({
  imports: [PrismaModule, StaffAuthModule],
  controllers: [StatController],
  providers: [StatService, PermissionsGuard],
})
export class StatModule {}

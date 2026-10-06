import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';

@Module({
  imports: [PrismaModule, StaffAuthModule],
  controllers: [OrderController],
  providers: [OrderService, PermissionsGuard],
  exports: [OrderService],
})
export class OrderModule {}

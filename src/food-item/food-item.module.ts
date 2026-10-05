import { Module } from '@nestjs/common';
import { FoodItemService } from './food-item.service';
import { FoodItemController } from './food-item.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';

@Module({
  imports: [PrismaModule, StaffAuthModule],
  controllers: [FoodItemController],
  providers: [
    FoodItemService,
    AdminOrStaffAuthGuard,
    AdminJwtAuthGuard,
    StaffJwtAuthGuard,
  ],
  exports: [FoodItemService],
})
export class FoodItemModule {}

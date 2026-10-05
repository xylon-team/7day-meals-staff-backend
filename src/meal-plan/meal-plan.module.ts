import { Module } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { AdminOrStaffAuthGuard } from './guards/admin-or-staff-auth.guard';

@Module({
  imports: [PrismaModule, AdminAuthModule, StaffAuthModule],
  controllers: [MealPlanController],
  providers: [
    MealPlanService,
    AdminOrStaffAuthGuard,
    AdminJwtAuthGuard,
    StaffJwtAuthGuard,
  ],
  exports: [MealPlanService],
})
export class MealPlanModule {}

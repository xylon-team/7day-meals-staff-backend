import { Module } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';

@Module({
  imports: [PrismaModule, StaffAuthModule],
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

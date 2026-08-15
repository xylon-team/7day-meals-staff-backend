import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanBodyDto } from './dto/create-meal-plan-body.dto';
import { UpdateMealPlanBodyDto } from './dto/update-meal-plan-body.dto';
import { UpdateMealPlanStatusDto } from './dto/update-meal-plan-status.dto';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';

@Controller('meal-plan')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post()
  @RequirePermissions('meal_package_add')
  create(@Body() body: CreateMealPlanBodyDto) {
    return this.mealPlanService.create(body.mealPlan, body.foodItems);
  }

  @Get()
  @RequirePermissions('meal_package_view')
  findAll() {
    return this.mealPlanService.findAll();
  }

  @Get(':id')
@RequirePermissions('meal_package_view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlanService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('meal_package_change')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMealPlanBodyDto,
  ) {
    return this.mealPlanService.update(id, body.mealPlan, body.foodItems);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('meal_package_change')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlanService.deactivate(id);
  }

  @Patch(':id/status')
  @RequirePermissions('meal_package_change')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateMealPlanStatusDto,
  ) {
    return this.mealPlanService.updateStatus(id, updateStatusDto.is_available);
  }

  @Delete(':id')
  @RequirePermissions('meal_package_delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlanService.remove(id);
  }
}

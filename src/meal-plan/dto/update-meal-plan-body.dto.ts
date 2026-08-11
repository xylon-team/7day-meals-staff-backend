import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateMealPlanDto } from './update-meal-plan.dto';
import { CreateMealPlanFoodItemDto } from './create-mp-fi.dto';

export class UpdateMealPlanBodyDto {
  @ValidateNested()
  @Type(() => UpdateMealPlanDto)
  mealPlan!: UpdateMealPlanDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealPlanFoodItemDto)
  foodItems?: CreateMealPlanFoodItemDto[];
}

import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealPlanDto } from './create-meal-plan.dto';
import { CreateMealPlanFoodItemDto } from './create-mp-fi.dto';

export class CreateMealPlanBodyDto {
  @ValidateNested()
  @Type(() => CreateMealPlanDto)
  mealPlan!: CreateMealPlanDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealPlanFoodItemDto)
  foodItems?: CreateMealPlanFoodItemDto[];
}

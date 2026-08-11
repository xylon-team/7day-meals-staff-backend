import { PartialType } from '@nestjs/mapped-types';
import { CreateMealPlanFoodItemDto } from './create-mp-fi.dto';

export class UpdateMealPlanFoodItemDto extends PartialType(CreateMealPlanFoodItemDto) {}

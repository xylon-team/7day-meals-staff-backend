import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMealPlanFoodItemDto {
  @IsInt()
  @IsNotEmpty()
  meal_id!: number;

  @IsInt()
  @IsNotEmpty()
  food_item_id!: number;

  @IsString()
  @IsNotEmpty()
  day!: string;

  @IsString()
  @IsNotEmpty()
  meal_type!: string;
}

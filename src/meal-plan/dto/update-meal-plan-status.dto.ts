import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMealPlanStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  is_available: boolean;
}

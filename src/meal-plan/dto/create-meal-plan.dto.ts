import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateMealPlanDto {
  @IsString()
  @IsNotEmpty()
  item_name!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  dietary_preference!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  image_path?: string;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}

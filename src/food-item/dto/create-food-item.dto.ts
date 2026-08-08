import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, IsBoolean } from 'class-validator';

export class CreateFoodItemDto {
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsString()
  @IsNotEmpty()
  ingredient_list: string;

  @IsOptional()
  @IsString()
  image_path?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}

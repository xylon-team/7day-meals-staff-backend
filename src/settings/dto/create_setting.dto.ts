import { IsNotEmpty, IsNumber, IsInt, IsPositive } from 'class-validator';

export class CreateSettingDto {
  @IsInt()
  @IsNotEmpty()
  delivery_radius: number;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  delivery_fee: number;
}

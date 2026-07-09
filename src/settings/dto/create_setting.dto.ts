import { IsNotEmpty, IsNumber, IsDecimal, IsPositive } from 'class-validator';

export class CreateSettingDto {
  @IsNumber()
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

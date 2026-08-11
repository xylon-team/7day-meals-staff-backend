import { IsInt, IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  customer_id!: number;

  @IsInt()
  @IsNotEmpty()
  meal_id!: number;

  @IsOptional()
  @IsInt()
  delivery_person_id?: number;

  @IsString()
  @IsNotEmpty()
  order_status!: string;

  @IsString()
  @IsNotEmpty()
  payment_status!: string;

  @IsString()
  @IsNotEmpty()
  delivery_status!: string;

  @IsDateString()
  @IsNotEmpty()
  delivery_preferred_date!: string;

  @IsOptional()
  @IsBoolean()
  is_a_subscribed_meal?: boolean;

  @IsOptional()
  @IsInt()
  offer_id?: number;
}

import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSupplierRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplier_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  inventory_id: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  required_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

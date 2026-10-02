import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SupplierDetails } from '../types/supplier-details';

// Trim text before validation so whitespace-only required fields are rejected.
const trimText = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

// ============= Supplier Contact Details =============
export class CreateSupplierDto implements SupplierDetails {
  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  agent_name: string;

  @Transform(trimText)
  @IsEmail()
  email: string;

  @Transform(trimText)
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  // --------------------- Optional Address ------------------
  @Transform(trimText)
  @IsOptional()
  @IsString()
  address_line_1?: string;

  @Transform(trimText)
  @IsOptional()
  @IsString()
  address_line_2?: string;

  @Transform(trimText)
  @IsOptional()
  @IsString()
  address_line_3?: string;
}

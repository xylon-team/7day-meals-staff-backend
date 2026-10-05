import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateOwnStaffProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  fname?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lname?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  phone_number?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

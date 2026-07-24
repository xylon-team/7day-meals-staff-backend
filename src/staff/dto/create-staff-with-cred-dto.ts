import { IsString, IsNotEmpty, IsEnum, IsEmail, MinLength, Matches } from 'class-validator';
import { StaffStatus } from './enums/staff_status.enum';

export class CreateStaffWithCredentialDto {
  @IsString()
  @IsNotEmpty()
  fname: string;

  @IsString()
  @IsNotEmpty()
  lname: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsEnum(StaffStatus)
  @IsNotEmpty()
  status: StaffStatus;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  staff_password: string;
}

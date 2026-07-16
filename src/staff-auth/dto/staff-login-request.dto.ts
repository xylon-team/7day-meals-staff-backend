import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class StaffLoginRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  staff_password: string;
}

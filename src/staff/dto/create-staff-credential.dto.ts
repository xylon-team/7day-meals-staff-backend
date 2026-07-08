import { IsString, IsNotEmpty, IsInt, IsEmail, MinLength, Matches } from 'class-validator';

export class CreateStaffCredentialDto {
  @IsInt()
  @IsNotEmpty()
  staff_id: number;

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

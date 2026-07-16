import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  admin_username: string;

  @IsString()
  @IsNotEmpty()
  admin_password: string;
}

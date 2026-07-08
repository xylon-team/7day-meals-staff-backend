import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLoginResponseDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}

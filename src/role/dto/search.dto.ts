import { IsString, IsOptional } from 'class-validator';

export class SearchRoleDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

import { Controller, Post, Body } from '@nestjs/common';
import { StaffAuthService } from './staff-auth.service';
import { StaffLoginRequestDto } from './dto/staff-login-request.dto';
import { StaffLoginResponseDto } from './dto/staff-login-response.dto';

@Controller('staff-auth')
export class StaffAuthController {
  constructor(private staffAuthService: StaffAuthService) {}

  @Post('login')
  async login(@Body() loginDto: StaffLoginRequestDto): Promise<StaffLoginResponseDto> {
    return this.staffAuthService.login(loginDto);
  }
}

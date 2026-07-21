import { Controller, Post, Body } from '@nestjs/common';
import { StaffAuthService } from './staff-auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StaffLoginRequestDto } from './dto/staff-login-request.dto';
import { StaffLoginResponseDto } from './dto/staff-login-response.dto';

@Controller('staff-auth')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  @Post('login')
  async login(@Body() loginDto: StaffLoginRequestDto): Promise<StaffLoginResponseDto> {
    return this.staffAuthService.login(loginDto);
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.staffAuthService.sendOtpEmail(forgotPasswordDto.email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.staffAuthService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.staffAuthService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.otp,
      resetPasswordDto.new_password,
    ); 
  }
}

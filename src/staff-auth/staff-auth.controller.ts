import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { StaffAuthService } from './staff-auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { StaffLoginRequestDto } from './dto/staff-login-request.dto';
import { StaffLoginResponseDto } from './dto/staff-login-response.dto';
import { StaffJwtAuthGuard } from './guards/staff-auth.guard';
import { UpdateOwnStaffProfileDto } from './dto/update-own-staff-profile.dto';
import { ChangeStaffPasswordDto } from './dto/change-staff-password.dto';

@Controller('staff-auth')
export class StaffAuthController {
  constructor(private readonly staffAuthService: StaffAuthService) {}

  @Post('login')
  async login(@Body() loginDto: StaffLoginRequestDto): Promise<StaffLoginResponseDto> {
    return this.staffAuthService.login(loginDto);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('me')
  getMyProfile(@Req() request: { user: { staffId: number } }) {
    return this.staffAuthService.getMyProfile(request.user.staffId);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Get('me/permissions')
  getMyPermissions(@Req() request: { user: { staffId: number } }) {
    return this.staffAuthService.getMyPermissions(request.user.staffId);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @Req() request: { user: { staffId: number } },
    @Body() updateDto: UpdateOwnStaffProfileDto,
  ) {
    return this.staffAuthService.updateMyProfile(request.user.staffId, updateDto);
  }

  @UseGuards(StaffJwtAuthGuard)
  @Patch('me/password')
  changeMyPassword(
    @Req() request: { user: { staffId: number } },
    @Body() changeDto: ChangeStaffPasswordDto,
  ) {
    return this.staffAuthService.changeMyPassword(request.user.staffId, changeDto);
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

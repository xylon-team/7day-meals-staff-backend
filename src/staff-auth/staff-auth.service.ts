import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { StaffLoginRequestDto } from './dto/staff-login-request.dto';
import { StaffLoginResponseDto } from './dto/staff-login-response.dto';


@Injectable()
export class StaffAuthService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService, private jwtService: JwtService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  async login(loginDto: StaffLoginRequestDto): Promise<StaffLoginResponseDto> {

    const { email, staff_password } = loginDto;

    const staffCredential = await this.prisma.staff_credential.findUnique({
      where: { email },
      include: {
        staff: true,
      },
    });

    if (!staffCredential) {
    throw new UnauthorizedException('Invalid credentials');
    }

    if (!staffCredential.staff || staffCredential.staff.status !== 'active') {
      throw new UnauthorizedException('Staff account is inactive');
    }
    
    const isPasswordValid = await bcrypt.compare(
      staff_password,
      staffCredential.staff_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: staffCredential.staff_id, email: staffCredential.email, token_version: staffCredential.token_version };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendOtpEmail(email: string) {
    // 1. Verify if staff credential exists with this email
    const credential = await this.prisma.staff_credential.findFirst({
      where: { email },
    });

    if (!credential) {
      throw new NotFoundException('No staff account associated with this email address');
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Set expiration time (e.g., 15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 4. Save to DB
    await this.prisma.password_reset_otp.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // 5. Send Email
    try {
      await this.transporter.sendMail({
        from: `"7Day Meals Staff" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
        html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 15 minutes.</p>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'OTP sent successfully to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    // Find the latest OTP for this email
    const record = await this.prisma.password_reset_otp.findFirst({
      where: { email, otp },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid OTP');
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    // 1. Verify OTP again to ensure security
    await this.verifyOtp(email, otp);

    // 2. Find the staff credential
    const credential = await this.prisma.staff_credential.findFirst({
      where: { email },
    });

    if (!credential) {
      throw new NotFoundException('Staff account not found');
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the password in DB
    await this.prisma.staff_credential.update({
      where: { staff_id: credential.staff_id },
      data: { staff_password: hashedPassword },
    });

    // 5. Delete all OTPs for this email to invalidate them
    await this.prisma.password_reset_otp.deleteMany({
      where: { email },
    });

    return { message: 'Password reset successfully' };
  }
}

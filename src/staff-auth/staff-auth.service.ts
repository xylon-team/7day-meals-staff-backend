import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { StaffLoginRequestDto } from './dto/staff-login-request.dto';
import { StaffLoginResponseDto } from './dto/staff-login-response.dto';

@Injectable()
export class StaffAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: StaffLoginRequestDto): Promise<StaffLoginResponseDto> {

    const { email, staff_password } = loginDto;

    const staffCredential = await this.prisma.staff_credential.findFirst({
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

    const payload = { sub: staffCredential.staff_id, email: staffCredential.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

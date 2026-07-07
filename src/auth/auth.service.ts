import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { admin_username, admin_password } = loginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { admin_username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      admin_password,
      admin.admin_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({
      where: { admin_id: admin.admin_id },
      data: { last_logged_in: new Date() },
    });

    const payload = { sub: admin.admin_id, username: admin.admin_username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

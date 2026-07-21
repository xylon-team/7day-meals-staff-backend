import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffJwtStrategy extends PassportStrategy(Strategy, 'staff-jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret as string,
    });
  }

  async validate(payload: any) {
    const staff = await this.prisma.staff.findUnique({
      where: { staff_id: payload.sub },
      include: {
        credential: true,
      },
    });

    if (!staff) {
      throw new UnauthorizedException();
    }
    if (staff.status !== 'active') {
      throw new UnauthorizedException('Staff account is not active');
    }
    if (!staff.credential) {
      throw new UnauthorizedException('Staff credentials not found');
    }
    if (payload.token_version !== staff.credential.token_version) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return { staffId: payload.sub, email: payload.email };
  }
}

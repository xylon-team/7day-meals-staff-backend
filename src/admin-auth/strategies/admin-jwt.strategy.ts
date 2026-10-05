import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy) {
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
    const isAdminToken = payload.user_type === 'admin'
      || (payload.user_type === undefined && typeof payload.username === 'string' && !payload.email);
    if (!isAdminToken || typeof payload.username !== 'string') {
      throw new UnauthorizedException();
    }

    const admin = await this.prisma.admin.findUnique({
      where: { admin_id: payload.sub },
    });

    if (!admin || admin.admin_username !== payload.username) {
      throw new UnauthorizedException();
    }

    return { adminId: payload.sub, username: payload.username };
  }
}

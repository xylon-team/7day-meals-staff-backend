import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../../admin-auth/guards/admin-jwt-auth.guard';
import { StaffJwtAuthGuard } from '../../staff-auth/guards/staff-auth.guard';

@Injectable()
export class AdminOrStaffAuthGuard implements CanActivate {
  constructor(
    private readonly adminJwtAuthGuard: AdminJwtAuthGuard,
    private readonly staffJwtAuthGuard: StaffJwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (await this.adminJwtAuthGuard.canActivate(context)) {
        return true;
      }
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
    }

    try {
      if (await this.staffJwtAuthGuard.canActivate(context)) {
        return true;
      }
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        throw error;
      }
    }

    throw new UnauthorizedException();
  }
}

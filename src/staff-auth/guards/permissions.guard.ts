import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.staffId) {
      throw new ForbiddenException('User not authenticated properly');
    }

    const staffRoles = await this.prisma.staff_role.findMany({
      where: { staff_id: user.staffId },
      include: {
        role: {
          include: {
            role_permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const userPermissions = new Set<string>();
    staffRoles.forEach(sr => {
      sr.role.role_permissions.forEach(rp => {
        userPermissions.add(rp.permission.permission_type);
      });
    });

    const hasPermission = requiredPermissions.some((permission) => userPermissions.has(permission));

    if (!hasPermission) {
       throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

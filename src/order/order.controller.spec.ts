import { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../staff-auth/decorators/permissions.decorator';
import { OrderController } from './order.controller';
import { OrderModule } from './order.module';

describe('OrderController access', () => {
  it('allows Admin or Staff authentication and applies order permissions', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, OrderController)).toEqual([
      AdminOrStaffAuthGuard,
      PermissionsGuard,
    ]);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, OrderController.prototype.findAll)).toEqual(['orders_view']);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, OrderController.prototype.updateStatus)).toEqual(['orders_change']);
  });

  it('allows an authenticated Admin through the permissions guard without a staff lookup', async () => {
    const handler = OrderController.prototype.findAll;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['orders_view']),
    } as unknown as Reflector;
    const prisma = { staff_role: { findMany: jest.fn() } };
    const guard = new PermissionsGuard(reflector, prisma as never);
    const context = {
      getHandler: () => handler,
      getClass: () => OrderController,
      switchToHttp: () => ({ getRequest: () => ({ user: { adminId: 1 } }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.staff_role.findMany).not.toHaveBeenCalled();
  });

  it('resolves order authentication and permission guards without connecting to the database', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-only-secret' })],
        }),
        OrderModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(AdminOrStaffAuthGuard)).toBeInstanceOf(AdminOrStaffAuthGuard);
    expect(moduleRef.get(PermissionsGuard)).toBeInstanceOf(PermissionsGuard);
    await moduleRef.close();
  });
});

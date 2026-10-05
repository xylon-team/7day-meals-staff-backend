import { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../staff-auth/decorators/permissions.decorator';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';

describe('StatController inventory dashboard response', () => {
  it('returns the inventory dashboard summary from the service', async () => {
    const summary = {
      total_inventory_items: 8,
      total_suppliers: 3,
      low_stock_items: 2,
      out_of_stock_items: 1,
      pending_supplier_requests: 4,
      recent_inventory_updates: [],
    };
    const service = {
      getAdminDashboardStats: jest.fn(),
      getInventoryDashboardSummary: jest.fn().mockResolvedValue(summary),
    } as unknown as StatService;
    const controller = new StatController(service);

    await expect(controller.getInventoryDashboardSummary()).resolves.toEqual(summary);
    expect(service.getInventoryDashboardSummary).toHaveBeenCalledTimes(1);
  });
});

describe('StatController inventory dashboard access', () => {
  const handler = StatController.prototype.getInventoryDashboardSummary;

  it('accepts the inventory view permission used by staff roles', async () => {
    const requiredPermissions = Reflect.getMetadata(PERMISSIONS_KEY, handler);
    expect(requiredPermissions).toEqual(['inventory_item_view']);

    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredPermissions),
    } as unknown as Reflector;
    const prisma = {
      staff_role: {
        findMany: jest.fn().mockResolvedValue([
          {
            role: {
              role_permissions: [
                { permission: { permission_type: 'inventory_item_view' } },
              ],
            },
          },
        ]),
      },
    };
    const guard = new PermissionsGuard(reflector, prisma as any);
    const context = {
      getHandler: () => handler,
      getClass: () => StatController,
      switchToHttp: () => ({ getRequest: () => ({ user: { staffId: 42 } }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('accepts both Admin and staff authentication paths', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, handler);
    expect(guards).toContain(AdminOrStaffAuthGuard);
    expect(guards).toContain(PermissionsGuard);
  });
});

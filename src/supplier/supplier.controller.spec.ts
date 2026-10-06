import { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../staff-auth/decorators/permissions.decorator';
import { SupplierController } from './supplier.controller';
import { SupplierModule } from './supplier.module';
import { SupplierService } from './supplier.service';

describe('SupplierController', () => {
  it('allows Admin or Staff authentication while retaining supplier permissions', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, SupplierController)).toEqual([
      AdminOrStaffAuthGuard,
      PermissionsGuard,
    ]);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, SupplierController.prototype.findAll)).toEqual(['supplier_view']);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, SupplierController.prototype.create)).toEqual(['supplier_add']);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, SupplierController.prototype.update)).toEqual(['supplier_change']);
  });

  it('allows an authenticated Admin through the permissions guard without a staff lookup', async () => {
    const handler = SupplierController.prototype.findAll;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['supplier_view']),
    } as unknown as Reflector;
    const prisma = { staff_role: { findMany: jest.fn() } };
    const guard = new PermissionsGuard(reflector, prisma as never);
    const context = {
      getHandler: () => handler,
      getClass: () => SupplierController,
      switchToHttp: () => ({ getRequest: () => ({ user: { adminId: 1 } }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(prisma.staff_role.findMany).not.toHaveBeenCalled();
  });

  it('resolves supplier authentication and permission guards without connecting to the database', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-only-secret' })],
        }),
        SupplierModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(AdminOrStaffAuthGuard)).toBeInstanceOf(AdminOrStaffAuthGuard);
    expect(moduleRef.get(PermissionsGuard)).toBeInstanceOf(PermissionsGuard);
    await moduleRef.close();
  });

  it('passes the supplier ID and partial update to the service', async () => {
    const supplier = { supplier_id: 7, email: 'new@example.com' };
    const service = {
      update: jest.fn().mockResolvedValue(supplier),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);
    const dto = { email: 'new@example.com' };

    await expect(controller.update(7, dto)).resolves.toEqual(supplier);
    expect(service.update).toHaveBeenCalledWith(7, dto);
  });

  it('returns supplier records from the service and passes the search term', async () => {
    const suppliers = [{ supplier_id: 1, name: 'Example Supplier' }];
    const service = {
      findAll: jest.fn().mockResolvedValue(suppliers),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);

    await expect(controller.findAll('Lanka')).resolves.toEqual(suppliers);
    expect(service.findAll).toHaveBeenCalledWith('Lanka');
  });

  it('passes an omitted search term to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as SupplierService;
    const controller = new SupplierController(service);

    await expect(controller.findAll()).resolves.toEqual([]);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });
});

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierRequestController } from './supplier-request.controller';
import { SupplierRequestService } from './supplier-request.service';
import { StaffAuthModule } from '../staff-auth/staff-auth.module';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';

@Module({
  imports: [PrismaModule, StaffAuthModule],
  controllers: [SupplierController, SupplierRequestController],
  providers: [SupplierService, SupplierRequestService, PermissionsGuard],
  exports: [SupplierService],
})
export class SupplierModule {}

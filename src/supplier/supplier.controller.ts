import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';
import { SupplierService } from './supplier.service';

@Controller('suppliers')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @RequirePermissions('supplier_view')
  findAll(@Query('search') search?: string) {
    return this.supplierService.findAll(search);
  }
}

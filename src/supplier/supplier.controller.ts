import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  // ============= Add Supplier =============
  @Post()
  @RequirePermissions('supplier_add')
  create(@Body() dto: CreateSupplierDto) {
    // Global validation checks contact details before persistence.
    return this.supplierService.create(dto);
  }

  @Get()
  @RequirePermissions('supplier_view')
  findAll(@Query('search') search?: string) {
    return this.supplierService.findAll(search);
  }

  // ============= Update Supplier =============
  @Patch(':id')
  @RequirePermissions('supplier_change')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    // Preserve fields omitted from a partial update.
    return this.supplierService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('supplier_change')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.deactivate(id);
  }
}

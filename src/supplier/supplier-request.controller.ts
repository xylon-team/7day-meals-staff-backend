import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { StaffJwtAuthGuard } from '../staff-auth/guards/staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';
import { CreateSupplierRequestDto } from './dto/create-supplier-request.dto';
import { SupplierRequestService } from './supplier-request.service';

@Controller('supplier-requests')
@UseGuards(StaffJwtAuthGuard, PermissionsGuard)
export class SupplierRequestController {
  constructor(private readonly supplierRequestService: SupplierRequestService) {}

  @Post()
  @RequirePermissions('supplier_add')
  create(
    @Body() dto: CreateSupplierRequestDto,
    @Req() request: { user: { staffId: number } },
  ) {
    return this.supplierRequestService.create(dto, request.user.staffId);
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { AdminDashboardDto } from './dto/admin-dashboard-response.dto';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';
import { PermissionsGuard } from '../staff-auth/guards/permissions.guard';
import { RequirePermissions } from '../staff-auth/decorators/permissions.decorator';
import { InventoryDashboardDto } from './dto/inventory-dashboard-response.dto';

@Controller('stats')
export class StatController {
  constructor(private readonly statService: StatService) {}

  // ADMIN DASHBOARD
  @UseGuards(AdminJwtAuthGuard)
  @Get('admin-dashboard')
  async getAdminDashboardStats(): Promise<AdminDashboardDto> {
    return this.statService.getAdminDashboardStats();
  }

  // INVENTORY MANAGER DASHBOARD
  @UseGuards(AdminOrStaffAuthGuard, PermissionsGuard)
  @RequirePermissions('inventory_item_view')
  @Get('inventory-dashboard')
  async getInventoryDashboardSummary(): Promise<InventoryDashboardDto> {
    return this.statService.getInventoryDashboardSummary();
  }
}

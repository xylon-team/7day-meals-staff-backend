import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { AdminDashboardDto } from './dto/admin-dashboard-response.dto';

@Controller('stats')
export class StatController {
  constructor(private readonly statService: StatService) {}

  //ADMIN DASHBOARD
  @UseGuards(AdminJwtAuthGuard)
  @Get('admin-dashboard')
  async getAdminDashboardStats(): Promise<AdminDashboardDto> {
    return this.statService.getAdminDashboardStats();
  }
}

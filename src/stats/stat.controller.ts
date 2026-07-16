import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatService } from './stat.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { AdminDashboardDto } from './dto/admin-dashboard-response.dto';

@Controller('stats')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin-dashboard')
  async getDashboardStats(): Promise<AdminDashboardDto> {
    return this.statService.getDashboardStats();
  }
}

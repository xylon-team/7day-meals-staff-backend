import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AdminJwtAuthGuard } from 'src/admin-auth/guards/admin-jwt-auth.guard';

@Controller('staff')
@UseGuards(AdminJwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  //CREATE ENDPOINT
  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  //READ ENDPOINTS
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  //UPDATE ENDPOINT
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(+id, updateStaffDto);
  }

  //DELETE ENDPOINT
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.staffService.delete(+id);
  }

}

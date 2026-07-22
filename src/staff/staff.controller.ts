import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { CreateStaffWithCredentialDto } from './dto/create-staff-with-cred-dto';
import { UpdateStaffCredentialDto } from './dto/update-staff-credential.dto';
import { UpdateStaffWithCredentialDto } from './dto/update-staff-with-cred-dto';

@Controller('staff')
@UseGuards(AdminJwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  //CREATE ENDPOINT
  @Post()
  create(@Body() createStaffWithCredentialDto: CreateStaffWithCredentialDto) {
    return this.staffService.createStaffWithCredential(createStaffWithCredentialDto);
  }

  //READ ENDPOINTS
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }
  //UPDATE ENDPOINT
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffWithCredentialDto: UpdateStaffWithCredentialDto,
  ) {
    return this.staffService.update(id, updateStaffWithCredentialDto);
  }

  //DELETE ENDPOINT
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.delete(id);
  }

  //CREDENTIAL ENDPOINTS
  // CREATE CREDENTIAL
  // @Post(':id/credential')
  // createCredential(@Param('id') id: string, @Body() createStaffCredentialDto: CreateStaffCredentialDto) {
  //   return this.staffService.createCredential({ ...createStaffCredentialDto, staff_id: +id });
  // }

  // READ CREDENTIAL
  // @Get(':id/credential')
  // findCredential(@Param('id') id: string) {
  //   return this.staffService.findCredentialByStaffId(+id);
  // }

  // UPDATE CREDENTIAL
  @Patch(':id/credential')
  updateCredential(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStaffCredentialDto: UpdateStaffCredentialDto,
  ) {
    return this.staffService.updateCredential(id, updateStaffCredentialDto);
  }

  // DELETE CREDENTIAL
  // @Delete(':id/credential')
  // deleteCredential(@Param('id') id: string) {
  //   return this.staffService.deleteCredential(+id);
  // }

  // STAFF ROLES
  @Post(':staff_id/role')
  assignRoles(@Param('staff_id') staffId: string, @Body() body: any) {
    const roleIds = Array.isArray(body) ? body : (body.role_ids || body.roles || []);
    return this.staffService.assignRoles(+staffId, roleIds);
  }

  @Get(':staff_id/role')
  getRoles(@Param('staff_id') staffId: string) {
    return this.staffService.getRoles(+staffId);
  }

  @Delete(':staff_id/role/:role_id')
  removeRole(@Param('staff_id') staffId: string, @Param('role_id') roleId: string) {
    return this.staffService.removeRole(+staffId, +roleId);
  }
}

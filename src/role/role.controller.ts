import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create_role.dto';
import { UpdateRoleDto } from './dto/update_role.dto';
import { SearchRoleDto } from './dto/search.dto';
import { AdminJwtAuthGuard } from 'src/admin-auth/guards/admin-jwt-auth.guard';

@Controller('role')
@UseGuards(AdminJwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  //READ ALL PERMISSIONS ENDPOINT
  @Get('permissions')
  readAllPermissions() {
    return this.roleService.readAllPermissions();
  }

  //CREATE
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  //READ
  @Get()
  findAll(@Query('includePermissions') includePermissions?: string) {
    return this.roleService.findAll(includePermissions === 'true');
  }

  //SEARCH
  //this has to come before READ BY ID. otherwise NestJS will prioritize that since the URL looks similar
  //could make this a POST request with a body but for now keeping it like this
  @Get('search')
  search(@Query() searchRoleDto: SearchRoleDto, @Query('includePermissions') includePermissions?: string) {
    return this.roleService.search(searchRoleDto, includePermissions === 'true');
  }

  //READ BY ID
  @Get(':id')
  findOne(@Param('id') id: string, @Query('includePermissions') includePermissions?: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.findById(parsedId, includePermissions === 'true');
  }

  //UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.update(parsedId, updateRoleDto);
  }

  //DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.delete(parsedId);
  }

  //GET A ROLE'S PERMISSION SET
  @Get(':id/permissions')
  getPermissions(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.getPermissionsByRoleId(parsedId);
  }

  //ASSIGN PERMS TO ROLE ENDPOINT
  @Post(':id/permissions')
  assignPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: number[]) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.assignPermissions(parsedId, permissionIds);
  }

  //REMOVE PERMS FROM ROLE ENDPOINT
  @Delete(':id/permissions')
  removePermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: number[]) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.roleService.removePermissions(parsedId, permissionIds);
  }
}

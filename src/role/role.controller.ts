import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseArrayPipe, ParseIntPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create_role.dto';
import { UpdateRoleDto } from './dto/update_role.dto';
import { SearchRoleDto } from './dto/search.dto';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';

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
  findOne(@Param('id', ParseIntPipe) id: number, @Query('includePermissions') includePermissions?: string) {
    return this.roleService.findById(id, includePermissions === 'true');
  }

  //UPDATE
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  //DELETE
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.delete(id);
  }

  //GET A ROLE'S PERMISSION SET
  @Get(':id/permissions')
  getPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.getPermissionsByRoleId(id);
  }

  //ASSIGN PERMS TO ROLE ENDPOINT
  @Post(':id/permissions')
  assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body('permissionIds', new ParseArrayPipe({ items: Number })) permissionIds: number[]
  ) {
    return this.roleService.assignPermissions(id, permissionIds);
  }

  //REMOVE PERMS FROM ROLE ENDPOINT
  @Delete(':id/permissions')
  removePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body('permissionIds', new ParseArrayPipe({ items: Number })) permissionIds: number[]
  ) {
    return this.roleService.removePermissions(id, permissionIds);
  }
}

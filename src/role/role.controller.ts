import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create_role.dto';
import { UpdateRoleDto } from './dto/update_role.dto';
import { SearchRoleDto } from './dto/search.dto';
import { AdminJwtAuthGuard } from 'src/admin-auth/guards/admin-jwt-auth.guard';

@Controller('role')
@UseGuards(AdminJwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

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
  findOne(@Param('id') id: string, @Query('includePermissions') includePermissions?: string,) {
    return this.roleService.findById(+id, includePermissions === 'true');
  }

  //UPDATE
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  //DELETE
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.roleService.delete(+id);
  }
  
}

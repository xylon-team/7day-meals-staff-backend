import { Injectable, NotFoundException, ConflictException, Search } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create_role.dto';
import { UpdateRoleDto } from './dto/update_role.dto';
import { SearchRoleDto } from './dto/search.dto';

//.dev note (Hiruna): I'm so proud of this one
@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  //CREATE
  async create(createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: createRoleDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Role already exists');
      }
      throw error;
    }
  }

  //READ
  async findAll(includePermissions: boolean = false) {
    return await this.prisma.role.findMany({
      include: includePermissions ? { 
        role_permissions: {
          include: {
            permission: true
          }
        } 
      } : undefined,
    });
  }

  async findById(id: number, includePermissions: boolean = false) {
    const role = await this.prisma.role.findUnique({
      where: { role_id: id },
      include: includePermissions ? {
        role_permissions: {
          include: {
            permission: true,
          },
        },
      } : undefined,
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    
    return role;
  }

  //SEARCH
  //allows searching for records by both role and description values combined
  async search(searchRoleDto: SearchRoleDto, includePermissions: boolean = false) {
    return await this.prisma.role.findMany({
      where: {
        AND: [
          searchRoleDto.role ? { role: { contains: searchRoleDto.role } } : {},
          searchRoleDto.description ? { description: { contains: searchRoleDto.description } } : {},
        ],
      },
      include: includePermissions ? {
        role_permissions: {
          include: {
            permission: true,
          },
        },
      } : undefined,
    });
  }

  //UPDATE
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      return await this.prisma.role.update({
        where: { role_id: id },
        data: updateRoleDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }

  //DELETE
  async delete(id: number) {
    try {
      return await this.prisma.role.delete({
        where: { role_id: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }
}

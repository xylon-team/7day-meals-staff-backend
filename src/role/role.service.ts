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

  //GET A ROLE'S PERMISSION SET
  async getPermissionsByRoleId(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { role_id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const rolePermissions = await this.prisma.role_permission.findMany({
      where: { role_id: roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map(rp => rp.permission);
  }

  //ASSIGNING PERMISSIONS TO ROLE
  async assignPermissions(roleId: number, permissionIds: number[]) {
    // First verify the role exists
    const role = await this.prisma.role.findUnique({
      where: { role_id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    try {
      // Create new role_permission entries, skipping duplicates
      return await this.prisma.role_permission.createMany({
        data: permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new NotFoundException(`One or more permission IDs are invalid`);
      }
      throw error;
    }
  }

  //REMOVING PERMISSIONS FROM ROLE
  async removePermissions(roleId: number, permissionIds: number[]) {
    // First verify the role exists
    const role = await this.prisma.role.findUnique({
      where: { role_id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return await this.prisma.role_permission.deleteMany({
      where: {
        role_id: roleId,
        permission_id: {
          in: permissionIds,
        },
      },
    });
  }

  //READ PERMISSIONS
  async readAllPermissions() {
    return await this.prisma.permission.findMany();
  }
}

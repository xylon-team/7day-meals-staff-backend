import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateStaffCredentialDto } from './dto/create-staff-credential.dto';
import { UpdateStaffCredentialDto } from './dto/update-staff-credential.dto';
import { CreateStaffWithCredentialDto } from './dto/create-staff-with-cred-dto';
import { UpdateStaffWithCredentialDto } from './dto/update-staff-with-cred-dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  //CREATE
  async create(createStaffDto: CreateStaffDto) {
    try {
      return await this.prisma.staff.create({
        data: createStaffDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Staff with this information already exists');
      }
      throw error;
    }
  }

  //READ
  async findAll() {
    return this.prisma.staff.findMany({
      include: {
        credential: {
          select: {
            email: true,
          },
        },
        staff_roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { staff_id: id },
      include: {
        credential: {
          select: {
            email: true,
          },
        },
        staff_roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }
    return staff;
  }

  //UPDATE
  async update(id: number, updateStaffWithCredentialDto: UpdateStaffWithCredentialDto) {
    try {
      const { email, staff_password, ...staffData } = updateStaffWithCredentialDto;

      // Filter out null and undefined values from staff data
      const filteredStaffDto = Object.fromEntries(
        Object.entries(staffData).filter(([_, value]) => value !== undefined && value !== null)
      );

      // Build credential update data
      const credentialData: any = {};
      if (email !== undefined && email !== null) {
        credentialData.email = email;
      }
      if (staff_password !== undefined && staff_password !== null) {
        credentialData.staff_password = await bcrypt.hash(staff_password, 10);
      }

      const hasCredentialUpdate = Object.keys(credentialData).length > 0;
      const hasStaffUpdate = Object.keys(filteredStaffDto).length > 0;

      if (hasCredentialUpdate && hasStaffUpdate) {
        // Batch update both staff and credential
        return await this.prisma.$transaction(async (tx) => {
          const staff = await tx.staff.update({
            where: { staff_id: id },
            data: filteredStaffDto,
          });

          await tx.staff_credential.update({
            where: { staff_id: id },
            data: {
              ...credentialData,
              token_version: { increment: 1 }, //UPDATING THE TOKEN VER
            },
          });

          return staff;
        });
      } else if (hasCredentialUpdate) {
        // Update only credential
        await this.prisma.staff_credential.update({
          where: { staff_id: id },
          data: {
            ...credentialData,
            token_version: { increment: 1 }, //UPDATING THE TOKEN VER
          },
        });
        return this.findOne(id);
      } else if (hasStaffUpdate) {
        // Update only staff
        return await this.prisma.staff.update({
          where: { staff_id: id },
          data: filteredStaffDto,
        });
      } else {
        throw new BadRequestException('No update data provided');
      }
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff with id ${id} not found`);
      }
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException(`Email already exists`);
        }
        throw new ConflictException('Staff with this information already exists');
      }
      throw error;
    }
  }

  //DELETE
  async delete(id: number) {
    try {
      return await this.prisma.staff.delete({
        where: { staff_id: id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff with id ${id} not found`);
      }
      throw error;
    }
  }

  //STAFF CREDENTIALS
  //CREATE CREDENTIAL
  async createCredential(createStaffCredentialDto: CreateStaffCredentialDto) {
    try {
      const hashedPassword = await bcrypt.hash(createStaffCredentialDto.staff_password, 10);
      return await this.prisma.staff_credential.create({
        data: {
          ...createStaffCredentialDto,
          staff_password: hashedPassword,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException(`Email already exists`);
        }
        throw new ConflictException(`Staff credential already exists for this staff member`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(`Invalid staff_id reference`);
      }
      throw error;
    }
  }

  //CREATE STAFF WITH CREDENTIAL (TRANSACTION)
  async createStaffWithCredential(createStaffWithCredentialDto: CreateStaffWithCredentialDto) {
    try {
      const hashedPassword = await bcrypt.hash(createStaffWithCredentialDto.staff_password, 10);
      
      return await this.prisma.$transaction(async (tx) => {
        const staff = await tx.staff.create({
          data: {
            fname: createStaffWithCredentialDto.fname,
            lname: createStaffWithCredentialDto.lname,
            phone_number: createStaffWithCredentialDto.phone_number,
            status: createStaffWithCredentialDto.status,
          },
        });

        const credential = await tx.staff_credential.create({
          data: {
            staff_id: staff.staff_id,
            email: createStaffWithCredentialDto.email,
            staff_password: hashedPassword,
          },
        });

        return staff;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException(`Email already exists`);
        }
        throw new ConflictException('Staff with this information already exists');
      }
      throw error;
    }
  }

  //READ CREDENTIAL
  async findCredentialByStaffId(staffId: number) {
    const credential = await this.prisma.staff_credential.findUnique({
      where: { staff_id: staffId },
    });
    if (!credential) {
      throw new NotFoundException(`Staff credential with staff_id ${staffId} not found`);
    }
    return credential;
  }

  //UPDATE CREDENTIAL
  async updateCredential(staffId: number, updateStaffCredentialDto: UpdateStaffCredentialDto) {
    try {
      const data: any = {};

      if (updateStaffCredentialDto.email !== undefined && updateStaffCredentialDto.email !== null) {
        data.email = updateStaffCredentialDto.email;
      }
      
      if (updateStaffCredentialDto.staff_password !== undefined && updateStaffCredentialDto.staff_password !== null) {
        data.staff_password = await bcrypt.hash(updateStaffCredentialDto.staff_password, 10);
      }

      if (Object.keys(data).length === 0) {
        throw new BadRequestException('No valid fields provided for update');
      }
      
      return await this.prisma.staff_credential.update({
        where: { staff_id: staffId },
        data: {
          ...data,
          token_version: { increment: 1 }, //UPDATING TOKEN VER
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff credential with staff_id ${staffId} not found`);
      }
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('email')) {
          throw new ConflictException(`Email already exists`);
        }
        throw new ConflictException(`Staff credential already exists for this staff member`);
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(`Invalid staff_id reference`);
      }
      throw error;
    }
  }

  //DELETE CREDENTIAL
  async deleteCredential(staffId: number) {
    try {
      return await this.prisma.staff_credential.delete({
        where: { staff_id: staffId },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff credential with staff_id ${staffId} not found`);
      }
      throw error;
    }
  }

  // STAFF ROLES
  async assignRoles(staffId: number, roleIds: number[]) {
    if (!roleIds || !Array.isArray(roleIds)) {
      throw new BadRequestException('Invalid roles data provided. Please provide an array of role IDs.');
    }
    
    const data = roleIds.map((roleId) => ({
      staff_id: staffId,
      role_id: roleId,
    }));
    
    return await this.prisma.staff_role.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async getRoles(staffId: number) {
    const staffRoles = await this.prisma.staff_role.findMany({
      where: { staff_id: staffId },
      include: {
        role: {
          include: {
            role_permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
    return staffRoles.map((sr) => sr.role);
  }

  async removeRole(staffId: number, roleId: number) {
    try {
      return await this.prisma.staff_role.delete({
        where: {
          staff_id_role_id: {
            staff_id: staffId,
            role_id: roleId,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role ${roleId} for staff ${staffId} not found`);
      }
      throw error;
    }
  }
}

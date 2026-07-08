import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffCredentialDto } from './dto/create-staff-credential.dto';
import { UpdateStaffCredentialDto } from './dto/update-staff-credential.dto';
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
    return this.prisma.staff.findMany();
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { staff_id: id },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }
    return staff;
  }

  //UPDATE
  async update(id: number, updateStaffDto: UpdateStaffDto) {
    try {
      return await this.prisma.staff.update({
        where: { staff_id: id },
        data: updateStaffDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Staff with id ${id} not found`);
      }
      if (error.code === 'P2002') {
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
      const data: any = { ...updateStaffCredentialDto };

      data.staff_id = staffId;
      
      if (updateStaffCredentialDto.staff_password) {
        data.staff_password = await bcrypt.hash(updateStaffCredentialDto.staff_password, 10);
      }
      
      return await this.prisma.staff_credential.update({
        where: { staff_id: staffId },
        data,
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

}

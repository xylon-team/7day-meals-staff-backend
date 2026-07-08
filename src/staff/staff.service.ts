import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  //CREATE
  async create(createStaffDto: CreateStaffDto) {
    return this.prisma.staff.create({
      data: createStaffDto,
    });
  }

  //READ
  async findAll() {
    return this.prisma.staff.findMany();
  }

  async findOne(id: number) {
    return this.prisma.staff.findUnique({
      where: { staff_id: id },
    });
  }

  //UPDATE
  async update(id: number, updateStaffDto: UpdateStaffDto) {
    return this.prisma.staff.update({
      where: { staff_id: id },
      data: updateStaffDto,
    });
  }

  //DELETE
  async delete(id: number) {
    return this.prisma.staff.delete({
      where: { staff_id: id },
    });
  }

}

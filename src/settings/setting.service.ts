import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto } from './dto/create_setting.dto';
import { UpdateSettingDto } from './dto/update_setting.dto';

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  //CREATE
  async create(createSettingDto: CreateSettingDto) {
    const existingSetting = await this.prisma.setting.findFirst();
    if (existingSetting) {
      throw new ConflictException('Setting already exists. Only one setting entry is allowed.');
    }
    return await this.prisma.setting.create({
      data: createSettingDto,
    });
  }

  //READ
  async readSetting() {
    const setting = await this.prisma.setting.findFirst();
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

  //UPDATE
  async update(updateSettingDto: UpdateSettingDto) {
    const existingSetting = await this.prisma.setting.findFirst();
    if (!existingSetting) {
      throw new NotFoundException('Setting not found');
    }
    
    try {
      return await this.prisma.setting.update({
        where: { setting_id: existingSetting.setting_id },
        data: updateSettingDto,
      });
    } catch (error) {
      throw error;
    }
  }



}
